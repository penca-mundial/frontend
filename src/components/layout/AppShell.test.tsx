import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
      screen.getByRole('link', { name: 'Magic Penca' }),
    ).toBeInTheDocument()
    expect(screen.getByText('home content')).toBeInTheDocument()
    expect(screen.getByText(/© \d{4} Magic Penca/)).toBeInTheDocument()
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

  it('hides the admin panel dropdown item from non-admins', async () => {
    const user = userEvent.setup()
    renderShell('/app/home', member)
    await user.click(screen.getByRole('button', { name: /member/ }))
    expect(
      await screen.findByRole('menuitem', { name: 'Perfil' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('menuitem', { name: 'Panel de administración' }),
    ).not.toBeInTheDocument()
  })

  it('links to the rules page from the user dropdown', async () => {
    const user = userEvent.setup()
    renderShell('/app/home', member)
    await user.click(screen.getByRole('button', { name: /member/ }))

    const rules = await screen.findByRole('menuitem', { name: 'Reglas' })
    expect(rules).toBeInTheDocument()
    expect(rules).toHaveAttribute('href', '/app/rules')
  })

  it('shows the admin panel dropdown item to admins', async () => {
    const user = userEvent.setup()
    renderShell('/app/home', { ...member, isAdmin: true })
    await user.click(screen.getByRole('button', { name: /member/ }))
    expect(
      await screen.findByRole('menuitem', { name: 'Panel de administración' }),
    ).toBeInTheDocument()
  })

  // Regression (SCRUM-305 header fix): on mobile the account menu opens from a
  // dedicated avatar button — Perfil and Reglas must be reachable there, since
  // those routes are linked nowhere else.
  it('exposes Perfil and Reglas from the mobile avatar account menu', async () => {
    const user = userEvent.setup()
    renderShell('/app/home', member)

    await user.click(screen.getByRole('button', { name: 'Tu cuenta' }))

    const perfil = await screen.findByRole('menuitem', { name: 'Perfil' })
    const reglas = await screen.findByRole('menuitem', { name: 'Reglas' })
    expect(perfil).toHaveAttribute('href', '/app/profile')
    expect(reglas).toHaveAttribute('href', '/app/rules')
  })

  it('keeps the mobile hamburger to the main nav only (no account links)', async () => {
    const user = userEvent.setup()
    renderShell('/app/home', member)

    await user.click(screen.getByRole('button', { name: 'Abrir menú' }))

    // The 5 nav sections are present…
    expect(
      await screen.findByRole('link', { name: 'Inicio' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Pencas' })).toBeInTheDocument()
    // …but the account links are not duplicated into the hamburger.
    expect(
      screen.queryByRole('link', { name: 'Perfil' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Reglas' }),
    ).not.toBeInTheDocument()
  })
})
