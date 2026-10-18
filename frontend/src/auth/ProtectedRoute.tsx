import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './auth-context'

type RedirectState = { from?: string } | null

export function ProtectedRoute() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

/** Telas de login e cadastro: quem já está autenticado volta para onde queria ir. */
export function PublicOnlyRoute() {
  const { user } = useAuth()
  const location = useLocation()

  if (user) {
    const from = (location.state as RedirectState)?.from ?? '/'
    return <Navigate to={from} replace />
  }

  return <Outlet />
}
