import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { PublicOnlyRoute } from '@/components/layout/PublicOnlyRoute'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AdminRoute } from '@/components/layout/AdminRoute'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/public/LoginPage'
import { ChooseUsernamePage } from '@/pages/onboarding/ChooseUsernamePage'
import { SignupPage } from '@/pages/public/SignupPage'
import { ForgotPasswordPage } from '@/pages/public/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/public/ResetPasswordPage'
import { ConfirmEmailPage } from '@/pages/public/ConfirmEmailPage'
import { OAuthCallbackPage } from '@/pages/public/OAuthCallbackPage'
import { LandingPage } from '@/pages/public/LandingPage'
import { HomePage } from '@/pages/app/HomePage'
import { GroupsPage } from '@/pages/app/GroupsPage'
import { CreateGroupPage } from '@/pages/app/CreateGroupPage'
import { JoinGroupPage } from '@/pages/app/JoinGroupPage'
import { GroupDetailPage } from '@/pages/app/GroupDetailPage'
import { FixturePage } from '@/pages/app/FixturePage'
import { MatchPage } from '@/pages/app/MatchPage'
import { MyPredictionsPage } from '@/pages/app/MyPredictionsPage'
import { RankingsPage } from '@/pages/app/RankingsPage'
import { TournamentPredictionPage } from '@/pages/app/TournamentPredictionPage'
import { ProfilePage } from '@/pages/app/ProfilePage'
import { NotFoundPage } from '@/pages/public/NotFoundPage'

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
      { path: '/app', element: <HomePage /> },
      { path: '/app/home', element: <HomePage /> },
      { path: '/app/matches', element: <FixturePage /> },
      { path: '/app/matches/:id', element: <MatchPage /> },
      { path: '/app/predictions/mine', element: <MyPredictionsPage /> },
      {
        path: '/app/predictions/tournament',
        element: <TournamentPredictionPage />,
      },
      { path: '/app/groups', element: <GroupsPage /> },
      { path: '/app/groups/new', element: <CreateGroupPage /> },
      { path: '/app/groups/join', element: <JoinGroupPage /> },
      { path: '/app/groups/:id', element: <GroupDetailPage /> },
      { path: '/app/rankings', element: <RankingsPage /> },
      { path: '/app/profile', element: <ProfilePage /> },
    ],
  },

  // Admin — gated: non-admins are redirected to /app/home. The panel itself
  // is still a placeholder (Phase 8).
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <Placeholder title="Administración" />
      </AdminRoute>
    ),
  },

  // 404 fallback
  { path: '*', element: <NotFoundPage /> },
]

export const router = createBrowserRouter(routes)
