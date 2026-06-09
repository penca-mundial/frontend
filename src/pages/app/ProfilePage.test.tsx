import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProfilePage } from '@/pages/app/ProfilePage'
import type { RankingEntry } from '@/types/domain'

vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}))
vi.mock('@/features/rankings/hooks/useRanking', () => ({ useRanking: vi.fn() }))
vi.mock('@/features/users/hooks/useUpdateProfile', () => ({
  useUpdateProfile: vi.fn(),
}))

import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useRanking } from '@/features/rankings/hooks/useRanking'
import { useUpdateProfile } from '@/features/users/hooks/useUpdateProfile'

const useCurrentUserMock = vi.mocked(useCurrentUser)
const useRankingMock = vi.mocked(useRanking)
const useUpdateProfileMock = vi.mocked(useUpdateProfile)

const me: RankingEntry = {
  userId: '9',
  username: 'santi',
  points: 134,
  position: 3,
  exactCount: 7,
  avatarUrl: null,
}

beforeEach(() => {
  vi.clearAllMocks()
  useCurrentUserMock.mockReturnValue({
    currentUser: {
      id: '9',
      email: 'santi@penca.dev',
      username: 'santi',
      isAdmin: false,
      avatarUrl: null,
      timezone: 'UTC',
      confirmedAt: '2026-01-01T00:00:00Z',
      needsUsername: false,
      provider: null,
      createdAt: '2026-03-15T00:00:00Z',
    },
    isLoading: false,
    refetch: vi.fn(),
    logout: vi.fn(),
  } as unknown as ReturnType<typeof useCurrentUser>)
  useRankingMock.mockReturnValue({
    entries: [me],
    me: [me],
    isLoading: false,
    isError: false,
    hasMore: false,
    loadMore: vi.fn(),
    isLoadingMore: false,
    total: 1247,
  } as unknown as ReturnType<typeof useRanking>)
  useUpdateProfileMock.mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateProfile>)
})

function renderPage() {
  return render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>,
  )
}

describe('ProfilePage', () => {
  it('renders the header card with the username and email', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Mi perfil' })).toBeInTheDocument()
    expect(screen.getAllByText('santi').length).toBeGreaterThan(0)
    expect(screen.getByText('santi@penca.dev')).toBeInTheDocument()
  })

  it('shows the stats with the participant total ("de N") when exposed', () => {
    renderPage()
    expect(screen.getByText('Posición')).toBeInTheDocument()
    expect(screen.getByText('3º')).toBeInTheDocument()
    expect(screen.getByText('de 1247')).toBeInTheDocument()
    expect(screen.getByText('134')).toBeInTheDocument()
    expect(screen.getByText('Aciertos exactos')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('shows "Miembro desde" from created_at', () => {
    renderPage()
    expect(screen.getByText(/Miembro desde/)).toBeInTheDocument()
    expect(screen.getByText(/2026/)).toBeInTheDocument()
  })

  it('has the Información (username edit) and a password Cuenta row', () => {
    renderPage()
    expect(screen.getByText('Información')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre de usuario')).toHaveValue('santi')
    expect(screen.getByText('Cuenta')).toBeInTheDocument()
    expect(screen.getByText('Contraseña')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Contraseña/ }),
    ).toHaveAttribute('href', '/forgot-password')
  })

  it('does NOT render a timezone field, account-deletion, logout, or "@" adornment', () => {
    renderPage()
    expect(screen.queryByText(/timezone|zona horaria/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/zona de peligro/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/eliminar cuenta/i)).not.toBeInTheDocument()
    // Logout now lives only in the header user menu, not on the page.
    expect(
      screen.queryByRole('button', { name: 'Cerrar sesión' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('@')).not.toBeInTheDocument()
  })

  it('offers click-to-upload on the avatar', () => {
    renderPage()
    expect(
      screen.getByRole('button', { name: 'Cambiar foto de perfil' }),
    ).toBeInTheDocument()
  })
})
