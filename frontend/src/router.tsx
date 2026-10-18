import { createBrowserRouter, Navigate } from 'react-router'
import { ProtectedRoute, PublicOnlyRoute } from './auth/ProtectedRoute'
import { AppLayout } from './components/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { OrdersPage } from './pages/OrdersPage'
import { RegisterPage } from './pages/RegisterPage'

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/cadastro', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [{ path: '/', element: <OrdersPage /> }],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
