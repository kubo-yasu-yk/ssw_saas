import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { apiClient } from '@lib/api'
import type { User } from '@types/index'
import { ApiError, notifyApiError, toApiError } from '@utils/errorHandler'
import { getItem, removeItem, setItem } from '@utils/storage'

type AuthContextType = {
  user: User | null
  session: AuthSession | null
  isAuthenticated: boolean
  isInitializing: boolean
  authError: ApiError | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  refreshSession: () => Promise<void>
}

interface AuthSession {
  user: User
  accessToken: string
  refreshToken?: string
  expiresAt: number
}

const SESSION_STORAGE_KEY = 'session:auth'
const LEGACY_SESSION_KEY = 'session:user'
const ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000
const REFRESH_MARGIN_MS = 60 * 1000

const demoUsers: Array<{ email: string; password: string; user: User }> = [
  {
    email: 'admin@example.com',
    password: 'password123',
    user: { id: 'u1', email: 'admin@example.com', name: '管理者', role: 'admin', companyId: 'c1' },
  },
]

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const generateToken = (prefix: 'access' | 'refresh', userId: string) => {
  return `${prefix}-${userId}-${Math.random().toString(36).slice(2)}-${Date.now()}`
}

const createSession = (user: User, expiresInMs: number = ACCESS_TOKEN_TTL_MS): AuthSession => {
  const expiresAt = Date.now() + expiresInMs
  return {
    user,
    accessToken: generateToken('access', user.id),
    refreshToken: generateToken('refresh', user.id),
    expiresAt,
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [authError, setAuthError] = useState<ApiError | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current)
      logoutTimerRef.current = null
    }
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
  }, [])

  const applySessionToClient = useCallback((value: AuthSession | null) => {
    if (value) {
      apiClient.setTokens({ accessToken: value.accessToken, refreshToken: value.refreshToken ?? null })
    } else {
      apiClient.clearTokens()
    }
  }, [])

  const persistSession = useCallback((value: AuthSession | null) => {
    if (value) {
      setItem(SESSION_STORAGE_KEY, value)
      setItem(LEGACY_SESSION_KEY, value.user)
    } else {
      removeItem(SESSION_STORAGE_KEY)
      removeItem(LEGACY_SESSION_KEY)
    }
  }, [])

  const updateSession = useCallback((value: AuthSession | null) => {
    setSession(value)
    setAuthError(null)
    applySessionToClient(value)
    persistSession(value)
  }, [applySessionToClient, persistSession])

  const logout = useCallback(() => {
    clearTimers()
    updateSession(null)
  }, [clearTimers, updateSession])

  const refreshSession = useCallback(async () => {
    if (!session?.refreshToken) {
      logout()
      return
    }
    try {
      // TODO: 実際のAPI連携時に /auth/refresh を呼び出す
      const refreshedSession: AuthSession = {
        ...session,
        accessToken: generateToken('access', session.user.id),
        expiresAt: Date.now() + ACCESS_TOKEN_TTL_MS,
      }
      updateSession(refreshedSession)
    } catch (error) {
      const apiError = notifyApiError(error, {
        fallbackMessage: 'セッションの更新に失敗しました。再度ログインしてください。',
      })
      setAuthError(apiError)
      logout()
      throw apiError
    }
  }, [logout, session, updateSession])

  const login = useCallback(async (email: string, password: string) => {
    setAuthError(null)
    try {
      // TODO: 実際のAPI連携時に /auth/login を呼び出す
      const found = demoUsers.find((candidate) => candidate.email === email && candidate.password === password)
      if (!found) {
        throw new ApiError({ status: 401, message: 'メールアドレスまたはパスワードが正しくありません。', code: 'invalid_credentials' })
      }
      const nextSession = createSession(found.user)
      updateSession(nextSession)
      return true
    } catch (error) {
      const apiError = notifyApiError(error, { fallbackMessage: 'ログインに失敗しました。資格情報をご確認ください。' })
      setAuthError(apiError)
      return false
    }
  }, [updateSession])

  useEffect(() => {
    const storedSession = getItem<AuthSession>(SESSION_STORAGE_KEY)
    if (storedSession) {
      updateSession(storedSession)
    } else {
      const legacyUser = getItem<User>(LEGACY_SESSION_KEY)
      if (legacyUser) {
        updateSession(createSession(legacyUser))
      }
    }
    setIsInitializing(false)
  }, [updateSession])

  useEffect(() => {
    clearTimers()
    if (!session) return

    const now = Date.now()
    const msUntilLogout = session.expiresAt - now
    if (msUntilLogout <= 0) {
      logout()
      return
    }

    logoutTimerRef.current = setTimeout(() => {
      logout()
    }, msUntilLogout)

    if (session.refreshToken) {
      const msUntilRefresh = Math.max(0, msUntilLogout - REFRESH_MARGIN_MS)
      refreshTimerRef.current = setTimeout(() => {
        refreshSession().catch(() => logout())
      }, msUntilRefresh)
    }

    return () => {
      clearTimers()
    }
  }, [clearTimers, logout, refreshSession, session])

  const value = useMemo<AuthContextType>(
    () => ({
      user: session?.user ?? null,
      session,
      isAuthenticated: !!session?.user,
      isInitializing,
      authError,
      login,
      logout,
      refreshSession,
    }),
    [authError, isInitializing, login, logout, refreshSession, session]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
