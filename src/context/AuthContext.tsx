import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getItem, removeItem, setItem } from '@utils/storage'
import type { User } from '@types/index'

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const demoUsers: Array<{ email: string; password: string; user: User }> = [
  {
    email: 'admin@example.com',
    password: 'password123',
    user: { id: 'u1', email: 'admin@example.com', name: '管理者', role: 'admin' },
  },
]

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const saved = getItem<User>('session:user')
    if (saved) setUser(saved)
  }, [])

  const login = async (email: string, password: string) => {
    const found = demoUsers.find((u) => u.email === email && u.password === password)
    if (found) {
      setUser(found.user)
      setItem('session:user', found.user)
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    removeItem('session:user')
  }

  const value = useMemo<AuthContextType>(() => ({ user, isAuthenticated: !!user, login, logout }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

