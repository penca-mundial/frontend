import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UserProfilePage } from '@/pages/app/UserProfilePage'
import type { PublicUserProfile } from '@/features/users/types'

vi.mock('@/features/users/hooks/useUserProfile', () => ({
  useUserProfile: vi.fn(),
}))
vi.mock('@/features/users/hooks/useUserPredictions', () => ({
  useUserPredictions: vi.fn(),
}))
vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}))

import { useUserProfile } from '@/features/users/hooks/useUserProfile'
import { useUserPredictions } from '@/features/users/hooks/useUserPredictions'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

const useUserProfileMock = vi.mocked(useUserProfile)
const useUserPredictionsMock = vi.mocked(useUserPredictions)
const useCurrentUserMock = vi.mocked(useCurrentUser)

const profile: PublicUserProfile = {
  user: { id: '42', username: 'leo', avatarUrl: null },
  globalRanking: { rankPosition: 7, points: 31, exactCount: 4, total: 128 },
  sharedGroups: [
    {
      id: '1',
      name: 'Pool General',
      isGeneralPool: true,
      rankPosition: 7,
      points: 31,
      total: 128,
    },
  ],
  tournamentPrediction: { available: false, reason: 'tournament_not_started' },
  stats: { exact: 4, correctWinner: 3, goalDifference: 2, missed: 5, total: 14 },
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/app/users/42']}>
      <Routes>
        <Route path="/app/users/:id" element={<UserProfilePage />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  useCurrentUserMock.mockReturnValue({
    currentUser: { id: '9' },
  } as unknown as ReturnType<typeof useCurrentUser>)
  useUserPredictionsMock.mockReturnValue({
    data: { pages: [{ entries: [], page: 1, hasMore: false }] },
    isLoading: false,
    isError: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
  } as unknown as ReturnType<typeof useUserPredictions>)
})

describe('UserProfilePage', () => {
  it('shows a skeleton while the profile loads', () => {
    useUserProfileMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useUserProfile>)

    const { container } = renderPage()
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull()
  })

  it('shows a not-found message on error', () => {
    useUserProfileMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof useUserProfile>)

    renderPage()
    expect(screen.getByText(/No encontramos este perfil/)).toBeInTheDocument()
  })

  it('composes the header, shared pencas, gated prediction and stats', () => {
    useUserProfileMock.mockReturnValue({
      data: profile,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useUserProfile>)

    renderPage()

    expect(
      screen.getByRole('heading', { level: 1, name: /leo/ }),
    ).toBeInTheDocument()
    expect(screen.getByText('Pool General')).toBeInTheDocument()
    expect(
      screen.getByText(/Se revela cuando arranca el Mundial/),
    ).toBeInTheDocument()
    expect(screen.getByText('Exactos')).toBeInTheDocument()
    // Viewer (id 9) is not this user (id 42) → no "· vos".
    expect(screen.queryByText(/· vos/)).not.toBeInTheDocument()
  })
})
