import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ChooseUsernamePage } from '@/pages/onboarding/ChooseUsernamePage'
import type { AuthContextValue } from '@/contexts/AuthContext'
import type { AuthUser } from '@/features/auth/types'

const authState: AuthContextValue = {
  currentUser: null,
  isLoading: false,
  refetch: vi.fn(),
  logout: vi.fn(),
}
vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: () => authState,
}))

function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 'u1',
    email: 'sosa@example.com',
    username: null,
    isAdmin: false,
    avatarUrl: null,
    timezone: null,
    confirmedAt: '2026-01-01T00:00:00Z',
    needsUsername: true,
    ...overrides,
  }
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/onboarding/username']}>
      <Routes>
        <Route path="/onboarding/username" element={<ChooseUsernamePage />} />
        <Route path="/app/home" element={<div>app home</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  authState.currentUser = null
})

describe('ChooseUsernamePage', () => {
  it('shows the form to a user that still needs a username', () => {
    authState.currentUser = makeUser({ needsUsername: true })
    renderPage()
    expect(screen.getByText('Elegí tu nombre de usuario')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre de usuario')).toBeInTheDocument()
  })

  it('redirects a user that already has a username to the app', () => {
    authState.currentUser = makeUser({ needsUsername: false, username: 'sosa' })
    renderPage()
    expect(screen.getByText('app home')).toBeInTheDocument()
    expect(
      screen.queryByText('Elegí tu nombre de usuario'),
    ).not.toBeInTheDocument()
  })
})
