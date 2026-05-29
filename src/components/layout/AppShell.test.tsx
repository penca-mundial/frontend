import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { vi } from 'vitest'
import {
  AuthContext,
  type AuthContextValue,
  type CurrentUser,
} from '@/contexts/AuthContext'
import { AppShell } from '@/components/layout/AppShell'

const member: CurrentUser = {
  id: '1',
  email: 'm@b.dev',
  username: 'member',
  isAdmin: false,
  avatarUrl: null,
  timezone: null,
  confirmedAt: '2026-01-01T00:00:00Z',
  needsUsername: false,
}

function renderShell(path = '/app/home', user: CurrentUser | null = member) {
  const value: AuthContextValue = {
    currentUser: user,
    isLoading: false,
    refetch: vi.fn(),
    logout: vi.fn(),
  }
  const router = createMemoryRouter(
    [
      {
        element: <AppShell />,
        children: [{ path: '/app/home', element: <div>home content</div> }],
      },
    ],
    { initialEntries: [path] },
  )
  return render(
    <AuthContext value={value}>
      <RouterProvider router={router} />
    </AuthContext>,
  )
}

describe('AppShell', () => {
  it('renders the header logo, routed outlet content and footer', () => {
    renderShell()
    expect(
      screen.getByRole('link', { name: 'Penca Mundial' }),
    ).toBeInTheDocument()
    expect(screen.getByText('home content')).toBeInTheDocument()
    expect(screen.getByText(/©/)).toBeInTheDocument()
  })

  it('renders a hamburger menu button for mobile', () => {
    renderShell()
    expect(
      screen.getByRole('button', { name: 'Abrir menú' }),
    ).toBeInTheDocument()
  })

  it('marks the active route link with aria-current', () => {
    renderShell('/app/home')
    expect(
      screen.getAllByRole('link', { current: 'page' }).length,
    ).toBeGreaterThan(0)
  })

  it('shows the Admin link only for admins', () => {
    renderShell('/app/home', member)
    expect(
      screen.queryByRole('link', { name: 'Admin' }),
    ).not.toBeInTheDocument()

    renderShell('/app/home', { ...member, isAdmin: true })
    expect(
      screen.getAllByRole('link', { name: 'Admin' }).length,
    ).toBeGreaterThan(0)
  })
})
