import { type ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { RouteLoading } from '@/components/layout/RouteLoading'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { readReturnTo } from '@/features/auth/returnTo'

/**
 * For logged-out-only pages (login, signup). Redirects authed users on — to the
 * `?returnTo=` destination when present (so an invite link survives login even
 * across the session-refetch race), otherwise to /app/home.
 */
export function PublicOnlyRoute({ children }: { children?: ReactNode }) {
  const { currentUser, isLoading } = useCurrentUser()
  const location = useLocation()

  if (isLoading) {
    return <RouteLoading />
  }
  if (currentUser) {
    return <Navigate to={readReturnTo(location.search) ?? '/app/home'} replace />
  }
  return children ? <>{children}</> : <Outlet />
}
