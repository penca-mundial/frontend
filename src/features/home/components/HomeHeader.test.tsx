import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HomeHeader } from '@/features/home/components/HomeHeader'
import type { Tournament } from '@/features/tournament-predictions/types'

vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}))
vi.mock('@/features/tournament-predictions/hooks/useTournament', () => ({
  useTournament: vi.fn(),
}))

import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useTournament } from '@/features/tournament-predictions/hooks/useTournament'

const useCurrentUserMock = vi.mocked(useCurrentUser)
const useTournamentMock = vi.mocked(useTournament)

const tournament: Tournament = {
  id: '1',
  name: 'Mundial 2026',
  startsAt: '2026-06-11T00:00:00Z',
  endsAt: '2026-07-19T00:00:00Z',
  externalCode: null,
  championId: null,
  runnerUpId: null,
  thirdPlaceId: null,
  fourthPlaceId: null,
  topScorerId: null,
  isLocked: false,
  secondsUntilKickoff: 0,
}

function mockUser(username: string | null) {
  useCurrentUserMock.mockReturnValue({
    currentUser: username === null ? null : { id: '9', username },
  } as unknown as ReturnType<typeof useCurrentUser>)
}

beforeEach(() => vi.clearAllMocks())

describe('HomeHeader', () => {
  it('greets the user with the tournament day and name', () => {
    mockUser('santi')
    useTournamentMock.mockReturnValue({
      data: tournament,
      isLoading: false,
    } as unknown as ReturnType<typeof useTournament>)

    render(<HomeHeader />)

    expect(screen.getByText('Hola, santi!')).toBeInTheDocument()
    expect(screen.getByText(/Día \d+ de 39 · Mundial 2026/)).toBeInTheDocument()
    // The ranking/points moved to the "Tu ranking" card.
    expect(screen.queryByText(/Vas Nº/)).not.toBeInTheDocument()
    expect(screen.queryByText(/puntos/)).not.toBeInTheDocument()
  })

  it('degrades gracefully before the tournament loads', () => {
    mockUser(null)
    useTournamentMock.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useTournament>)

    render(<HomeHeader />)

    expect(screen.getByText('Hola, jugador!')).toBeInTheDocument()
    expect(screen.queryByText(/Día/)).not.toBeInTheDocument()
  })
})
