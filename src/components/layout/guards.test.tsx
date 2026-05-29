import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { vi } from 'vitest'
import {
  AuthContext,
  type AuthContextValue,
  type CurrentUser,
} from '@/contexts/AuthContext'
import { AdminRoute } from '@/components/layout/AdminRoute'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { PublicOnlyRoute } from '@/components/layout/PublicOnlyRoute'

const routes = [
  {
    path: '/login',
    element: <PublicOnlyRoute />,
    children: [{ index: true, element: <div>login page</div> }],
  },
  {
    element: <ProtectedRoute />,
    children: [{ path: '/app/home', element: <div>app home</div> }],
  },
  {
    path: '/admin',
    element: <AdminRoute />,
    children: [{ index: true, element: <div>admin page</div> }],
  },
]

function renderAt(path: string, auth: Partial<AuthContextValue>) {
  const value: AuthContextValue = {
    currentUser: null,
    isLoading: false,
    refetch: vi.fn(),
    logout: vi.fn(),
    ...auth,
  }
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(
    <AuthContext value={value}>
      <RouterProvider router={router} />
    </AuthContext>,
  )
}

const admin: CurrentUser = {
  id: '1',
  email: 'a@b.dev',
  username: 'admin',
  isAdmin: true,
  avatarUrl: null,
  timezone: null,
  confirmedAt: '2026-01-01T00:00:00Z',
  needsUsername: false,
}
const member: CurrentUser = { ...admin, isAdmin: false, username: 'member' }

describe('route guards', () => {
  it('redirects an unauthenticated user from /app/home to /login', () => {
    renderAt('/app/home', { currentUser: null })
    expect(screen.getByText('login page')).toBeInTheDocument()
  })

  it('redirects a non-admin user from /admin to /app/home', () => {
    renderAt('/admin', { currentUser: member })
    expect(screen.getByText('app home')).toBeInTheDocument()
  })

  it('redirects an authenticated user from /login to /app/home', () => {
    renderAt('/login', { currentUser: member })
    expect(screen.getByText('app home')).toBeInTheDocument()
  })

  it('lets an admin reach /admin', () => {
    renderAt('/admin', { currentUser: admin })
    expect(screen.getByText('admin page')).toBeInTheDocument()
  })

  it('shows a loading state while auth is hydrating', () => {
    renderAt('/app/home', { currentUser: null, isLoading: true })
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
