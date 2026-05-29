import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OAuthCallbackPage } from '@/pages/public/OAuthCallbackPage'
import type { AuthContextValue } from '@/contexts/AuthContext'
import type { AuthUser } from '@/features/auth/types'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

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
    username: 'sosa',
    isAdmin: false,
    avatarUrl: null,
    timezone: null,
    confirmedAt: '2026-01-01T00:00:00Z',
    needsUsername: false,
    ...overrides,
  }
}

function renderAt(search = '') {
  return render(
    <MemoryRouter initialEntries={[`/auth/google/callback${search}`]}>
      <OAuthCallbackPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  authState.currentUser = null
  authState.isLoading = false
})

describe('OAuthCallbackPage', () => {
  it('routes to the app home for a user that already has a username', async () => {
    authState.currentUser = makeUser({ needsUsername: false })
    renderAt()

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/app/home', { replace: true }),
    )
  })

  it('routes to onboarding when the user still needs a username', async () => {
    authState.currentUser = makeUser({ needsUsername: true, username: null })
    renderAt()

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/onboarding/username', {
        replace: true,
      }),
    )
  })

  it('falls back to login when no session resolves', async () => {
    authState.currentUser = null
    renderAt()

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/login?error=oauth_failed', {
        replace: true,
      }),
    )
  })

  it('shows the use_password error without redirecting', () => {
    renderAt('?error=use_password')

    expect(
      screen.getByText(/Esta cuenta ya existe con email y contraseña/),
    ).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
