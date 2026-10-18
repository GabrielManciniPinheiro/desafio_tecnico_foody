import { Link, Outlet } from 'react-router'
import { useAuth } from '../auth/auth-context'
import { Button } from './Button'
import { Logo } from './Logo'

export function AppLayout() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" aria-label="Página inicial">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">
              Olá, <span className="font-medium text-slate-900">{user?.name}</span>
            </span>
            <Button variant="secondary" onClick={signOut}>
              Sair
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
