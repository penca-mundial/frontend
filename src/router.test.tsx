import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { vi } from 'vitest'
import {
  AuthContext,
  type AuthContextValue,
  type CurrentUser,
} from '@/contexts/AuthContext'
import { routes } from '@/router'
import { server } from '@/test/mocks/server'

// Production-shaped user: the backend serializes numeric ids; the mapper
// normalizes them to strings at the boundary (ADR 0004).
const member: CurrentUser = {
  id: '7',
  email: 'member@penca.dev',
  username: 'member',
  isAdmin: false,
  avatarUrl: null,
  timezone: null,
  confirmedAt: '2026-01-01T00:00:00Z',
  needsUsername: false,
}

function renderAt(path: string, user: CurrentUser | null = member) {
  // Pages reached via redirects (e.g. /app/home) fire queries on mount; a
  // catch-all keeps MSW quiet and lets those pages settle into empty states.
  server.use(http.get('*', () => HttpResponse.json({})))

  const value: AuthContextValue = {
    currentUser: user,
    isLoading: false,
    refetch: vi.fn(),
    logout: vi.fn(),
  }
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext value={value}>
        <RouterProvider router={router} />
      </AuthContext>
    </QueryClientProvider>,
  )
}

describe('router', () => {
  it('renders the profile page at /app/profile (not a 404)', () => {
    renderAt('/app/profile')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Mi perfil' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Información')).toBeInTheDocument()
  })

  it('renders the styled not-found page for unknown routes', () => {
    renderAt('/definitely/not/a/route')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Página no encontrada' }),
    ).toBeInTheDocument()
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Volver al inicio' }),
    ).toBeInTheDocument()
  })

  it('redirects a non-admin user away from /admin', async () => {
    renderAt('/admin')
    // The dashboard greets the user by name; its presence marks the redirect home.
    expect(
      await screen.findByRole('heading', { name: 'Hola, member!' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Administración')).not.toBeInTheDocument()
  })

  it('lets an admin reach /admin', () => {
    renderAt('/admin', { ...member, isAdmin: true })
    expect(screen.getByText('Administración')).toBeInTheDocument()
  })
})
