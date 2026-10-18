import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { setAuthToken, setUnauthorizedHandler } from '../lib/api'
import { AuthContext } from './auth-context'
import type { AuthResponse, User } from './types'

const STORAGE_KEY = 'foody.session'

type Session = {
  token: string
  user: User
  expiresAt: number
}

function loadSession(): Session | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const session = JSON.parse(stored) as Session
    if (session.expiresAt <= Date.now()) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return session
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<Session | null>(() => {
    // O token precisa estar disponível antes da primeira requisição das páginas filhas
    const stored = loadSession()
    setAuthToken(stored?.token ?? null)
    return stored
  })

  const signIn = useCallback((response: AuthResponse) => {
    const newSession: Session = {
      token: response.accessToken,
      user: response.user,
      expiresAt: Date.now() + response.expiresIn * 1000,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession))
    setAuthToken(newSession.token)
    setSession(newSession)
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setAuthToken(null)
    setSession(null)
    // Descarta os dados em cache para não vazarem para a próxima sessão
    queryClient.clear()
  }, [queryClient])

  useEffect(() => {
    setUnauthorizedHandler(signOut)
    return () => setUnauthorizedHandler(null)
  }, [signOut])

  // Encerra a sessão automaticamente quando o token expira
  useEffect(() => {
    if (!session) return
    const timeout = setTimeout(signOut, session.expiresAt - Date.now())
    return () => clearTimeout(timeout)
  }, [session, signOut])

  const value = useMemo(
    () => ({ user: session?.user ?? null, signIn, signOut }),
    [session, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
