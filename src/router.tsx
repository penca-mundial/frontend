import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { PublicOnlyRoute } from '@/components/layout/PublicOnlyRoute'
import { LoginPage } from '@/pages/public/LoginPage'
import { SignupPage } from '@/pages/public/SignupPage'
import { ForgotPasswordPage } from '@/pages/public/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/public/ResetPasswordPage'
import { ConfirmEmailPage } from '@/pages/public/ConfirmEmailPage'

/**
 * Placeholder page. Real pages and layouts arrive in their feature tickets;
 * this file only establishes the route-group skeleton (public, onboarding,
 * app, admin) plus a 404 fallback.
 */
function Placeholder({ title }: { title: string }) {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">{title}</h1>
    </main>
  )
}

function NotFound() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">404</h1>
      <p className="text-muted-foreground">Página no encontrada.</p>
    </main>
  )
}

export const routes: RouteObject[] = [
  // Public
  { path: '/', element: <Placeholder title="Penca Mundial" /> },
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/signup',
    element: (
      <PublicOnlyRoute>
        <SignupPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicOnlyRoute>
        <ForgotPasswordPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <PublicOnlyRoute>
        <ResetPasswordPage />
      </PublicOnlyRoute>
    ),
  },
  // /confirm-email is reachable by anyone landing from the email link — not
  // gated behind PublicOnlyRoute.
  { path: '/confirm-email', element: <ConfirmEmailPage /> },

  // Onboarding
  {
    path: '/onboarding/username',
    element: <Placeholder title="Elegí tu nombre de usuario" />,
  },

  // App (authenticated)
  { path: '/app', element: <Placeholder title="Inicio" /> },

  // Admin
  { path: '/admin', element: <Placeholder title="Administración" /> },

  // 404 fallback
  { path: '*', element: <NotFound /> },
]

export const router = createBrowserRouter(routes)
