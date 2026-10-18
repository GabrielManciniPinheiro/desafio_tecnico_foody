import { createContext, useContext } from 'react'
import type { AuthResponse, User } from './types'

export type AuthContextValue = {
  user: User | null
  signIn: (response: AuthResponse) => void
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return context
}
