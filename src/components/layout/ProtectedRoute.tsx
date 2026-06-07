import { type ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { RouteLoading } from '@/components/layout/RouteLoading'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { loginWithReturnTo } from '@/features/auth/returnTo'

/**
 * Requires an authenticated user; otherwise redirects to /login carrying the
 * attempted destination as `?returnTo=`, so the user lands back here after auth
 * (e.g. an invite link `/app/groups/join?code=X`).
 */
export function ProtectedRoute({ children }: { children?: ReactNode }) {
  const { currentUser, isLoading } = useCurrentUser()
  const location = useLocation()

  if (isLoading) {
    return <RouteLoading />
  }
  if (!currentUser) {
    return (
      <Navigate
        to={loginWithReturnTo(location.pathname + location.search)}
        replace
      />
    )
  }
  return children ? <>{children}</> : <Outlet />
}
