import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Session as SupabaseSession } from '@supabase/supabase-js'

import { supabase } from '@services/supabase'
import type { User } from '@types/index'
import { ApiError, notifyApiError } from '@utils/errorHandler'

type AuthContextType = {
  user: User | null
  session: SupabaseSession | null
  isAuthenticated: boolean
  isInitializing: boolean
  authError: ApiError | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<SupabaseSession | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [authError, setAuthError] = useState<ApiError | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  // プロフィール情報を取得してUserオブジェクトを構築
  const fetchUserProfile = useCallback(async (userId: string): Promise<User | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Failed to fetch user profile:', error)
        return null
      }

      if (!profile) return null

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as 'admin' | 'operator',
        companyId: profile.company_id,
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }, [])

  // ログイン処理
  const login = useCallback(
    async (email: string, password: string) => {
      setAuthError(null)
      try {
        try {
          const {
            data: { session: existingSession },
          } = await supabase.auth.getSession()
          if (existingSession) {
            await supabase.auth.signOut()
            setSession(null)
            setUser(null)
          }
        } catch (cleanupError) {
          console.warn('Failed to clear existing session before login:', cleanupError)
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          throw new ApiError({
            status: 401,
            message: error.message || 'メールアドレスまたはパスワードが正しくありません。',
            code: 'invalid_credentials',
          })
        }

        if (!data.session) {
          throw new ApiError({
            status: 401,
            message: 'セッションの作成に失敗しました。',
            code: 'session_error',
          })
        }

        // プロフィールを取得
        const userProfile = await fetchUserProfile(data.user.id)
        if (!userProfile) {
          throw new ApiError({
            status: 404,
            message: 'ユーザープロフィールが見つかりません。',
            code: 'profile_not_found',
          })
        }

        setSession(data.session)
        setUser(userProfile)
        return true
      } catch (error) {
        const apiError = notifyApiError(error, {
          fallbackMessage: 'ログインに失敗しました。資格情報をご確認ください。',
        })
        setAuthError(apiError)
        return false
      }
    },
    [fetchUserProfile]
  )

  // ログアウト処理
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout error:', error)
    }
    setSession(null)
    setUser(null)
    setAuthError(null)
  }, [])

  // セッション更新処理
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        throw error
      }

      if (data.session) {
        setSession(data.session)
        if (data.user) {
          const userProfile = await fetchUserProfile(data.user.id)
          if (userProfile) {
            setUser(userProfile)
          }
        }
      }
    } catch (error) {
      const apiError = notifyApiError(error, {
        fallbackMessage: 'セッションの更新に失敗しました。再度ログインしてください。',
      })
      setAuthError(apiError)
      await logout()
      throw apiError
    }
  }, [fetchUserProfile, logout])

  // 初期化処理：セッションの復元
  useEffect(() => {
    let mounted = true
    let initialResolved = false

    const applySession = async (incoming: SupabaseSession | null) => {
      if (!mounted) return
      setSession(incoming)

      if (incoming?.user) {
        const userProfile = await fetchUserProfile(incoming.user.id)
        if (!mounted) return

        if (userProfile) {
          setUser(userProfile)
        } else {
          // プロフィールが存在しない場合はエラー扱いとし、セッションを破棄
          const profileError = new ApiError({
            status: 404,
            message: 'ユーザープロフィールが見つかりません。',
            code: 'profile_not_found',
          })
          setAuthError(profileError)
          setUser(null)
          await supabase.auth.signOut()
        }
      } else {
        setUser(null)
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return
      console.log('Auth state changed:', event)
      await applySession(newSession)
      if (mounted && (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT')) {
        initialResolved = true
        setIsInitializing(false)
      }
      if (event === 'SIGNED_IN' && mounted) {
        setAuthError(null)
      }
    })

    supabase
      .auth
      .getSession()
      .then(async ({ data: { session: existingSession } }) => {
        if (!mounted || initialResolved) return
        try {
          await applySession(existingSession)
        } catch (error) {
          console.error('Auth initialization error:', error)
        } finally {
          if (mounted) {
            setIsInitializing(false)
          }
        }
      })
      .catch((error) => {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setIsInitializing(false)
        }
      })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchUserProfile])

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      isAuthenticated: !!user && !!session,
      isInitializing,
      authError,
      login,
      logout,
      refreshSession,
    }),
    [authError, isInitializing, login, logout, refreshSession, session, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
