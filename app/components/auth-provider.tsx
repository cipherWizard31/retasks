'use client'

import React, { createContext, useContext } from 'react'
import type { AuthUser } from '@/lib/definitions'

const AuthContext = createContext<AuthUser | null>(null)

export function AuthProvider({
  user,
  children,
}: {
  user: AuthUser | null
  children: React.ReactNode
}) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
