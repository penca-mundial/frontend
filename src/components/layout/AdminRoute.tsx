import { type ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { RouteLoading } from '@/components/layout/RouteLoading'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

/** Requires an admin user; otherwise redirects to /app/home. */
export function AdminRoute({ children }: { children?: ReactNode }) {
  const { currentUser, isLoading } = useCurrentUser()

  if (isLoading) {
    return <RouteLoading />
  }
  if (!currentUser?.isAdmin) {
    return <Navigate to="/app/home" replace />
  }
  return children ? <>{children}</> : <Outlet />
}
