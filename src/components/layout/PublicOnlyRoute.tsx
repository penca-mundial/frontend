import { type ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { RouteLoading } from '@/components/layout/RouteLoading'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

/** For logged-out-only pages (login, signup); redirects authed users to /app/home. */
export function PublicOnlyRoute({ children }: { children?: ReactNode }) {
  const { currentUser, isLoading } = useCurrentUser()

  if (isLoading) {
    return <RouteLoading />
  }
  if (currentUser) {
    return <Navigate to="/app/home" replace />
  }
  return children ? <>{children}</> : <Outlet />
}
