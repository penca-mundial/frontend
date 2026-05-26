import { type ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { RouteLoading } from '@/components/layout/RouteLoading'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

/** Requires an authenticated user; otherwise redirects to /login. */
export function ProtectedRoute({ children }: { children?: ReactNode }) {
  const { currentUser, isLoading } = useCurrentUser()

  if (isLoading) {
    return <RouteLoading />
  }
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  return children ? <>{children}</> : <Outlet />
}
