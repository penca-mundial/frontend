import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { PublicOnlyRoute } from '@/components/layout/PublicOnlyRoute'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/public/LoginPage'
import { ChooseUsernamePage } from '@/pages/onboarding/ChooseUsernamePage'
import { SignupPage } from '@/pages/public/SignupPage'
import { ForgotPasswordPage } from '@/pages/public/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/public/ResetPasswordPage'
import { ConfirmEmailPage } from '@/pages/public/ConfirmEmailPage'
import { OAuthCallbackPage } from '@/pages/public/OAuthCallbackPage'
import { LandingPage } from '@/pages/public/LandingPage'
import { FixturePage } from '@/pages/app/FixturePage'
import { MatchPage } from '@/pages/app/MatchPage'
import { MyPredictionsPage } from '@/pages/app/MyPredictionsPage'
import { TournamentPredictionPage } from '@/pages/app/TournamentPredictionPage'

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
  {
    path: '/',
    element: (
      <PublicOnlyRoute>
        <LandingPage />
      </PublicOnlyRoute>
    ),
  },
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
  // OAuth return: the user is already authenticated here, so it must not sit
  // behind PublicOnlyRoute — the page resolves the session and routes itself.
  { path: '/auth/google/callback', element: <OAuthCallbackPage /> },

  // Onboarding
  {
    path: '/onboarding/username',
    element: (
      <ProtectedRoute>
        <ChooseUsernamePage />
      </ProtectedRoute>
    ),
  },

  // App (authenticated) — wrapped in the AppShell (Header + Footer) layout.
  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { path: '/app', element: <Placeholder title="Inicio" /> },
      { path: '/app/home', element: <Placeholder title="Inicio" /> },
      { path: '/app/matches', element: <FixturePage /> },
      { path: '/app/matches/:id', element: <MatchPage /> },
      { path: '/app/predictions/mine', element: <MyPredictionsPage /> },
      {
        path: '/app/predictions/tournament',
        element: <TournamentPredictionPage />,
      },
    ],
  },

  // Admin
  { path: '/admin', element: <Placeholder title="Administración" /> },

  // 404 fallback
  { path: '*', element: <NotFound /> },
]

export const router = createBrowserRouter(routes)
