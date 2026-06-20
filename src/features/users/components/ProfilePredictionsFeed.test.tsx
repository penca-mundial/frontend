import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProfilePredictionsFeed } from '@/features/users/components/ProfilePredictionsFeed'
import type { Match, MatchStatus } from '@/features/matches/types'

vi.mock('@/features/users/hooks/useUserPredictions', () => ({
  useUserPredictions: vi.fn(),
}))

import { useUserPredictions } from '@/features/users/hooks/useUserPredictions'

const useUserPredictionsMock = vi.mocked(useUserPredictions)
const fetchNextPage = vi.fn()

function match(
  id: string,
  status: MatchStatus,
  pick: { home: number; away: number; points: number },
): Match {
  return {
    id,
    externalId: null,
    tournamentId: '1',
    kickoffAt: '2026-06-12T19:00:00Z',
    status,
    phase: 'group_stage',
    group: 'A',
    minute: status === 'live' ? 67 : null,
    homeScore: 1,
    awayScore: 0,
    advancingTeamId: null,
    homeTeam: { id: '10', name: 'Argentina', code3: 'ARG', flagUrl: null },
    awayTeam: { id: '11', name: 'Brasil', code3: 'BRA', flagUrl: null },
    myPrediction: {
      id: `${id}:pick`,
      matchId: id,
      predictedHomeScore: pick.home,
      predictedAwayScore: pick.away,
      predictedAdvancingTeamId: null,
      lockedAt: null,
      locked: true,
      points: pick.points,
    },
  }
}

function mockFeed(state: {
  entries?: Match[]
  isLoading?: boolean
  isError?: boolean
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
}) {
  useUserPredictionsMock.mockReturnValue({
    data:
      state.isLoading || state.isError
        ? undefined
        : { pages: [{ entries: state.entries ?? [], page: 1, hasMore: false }] },
    isLoading: state.isLoading ?? false,
    isError: state.isError ?? false,
    hasNextPage: state.hasNextPage ?? false,
    isFetchingNextPage: state.isFetchingNextPage ?? false,
    fetchNextPage,
  } as unknown as ReturnType<typeof useUserPredictions>)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ProfilePredictionsFeed', () => {
  it('shows skeletons while loading', () => {
    mockFeed({ isLoading: true })
    const { container } = render(<ProfilePredictionsFeed userId="42" />)
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull()
  })

  it('shows an error message on failure', () => {
    mockFeed({ isError: true })
    render(<ProfilePredictionsFeed userId="42" />)
    expect(screen.getByText(/No pudimos cargar los partidos/)).toBeInTheDocument()
  })

  it('shows a graceful empty state', () => {
    mockFeed({ entries: [] })
    render(<ProfilePredictionsFeed userId="42" />)
    expect(
      screen.getByText(/Todavía no hay pronósticos para mostrar/),
    ).toBeInTheDocument()
  })

  it('renders a card per entry with the neutral "Pronóstico" pick label', () => {
    mockFeed({
      entries: [
        match('1', 'live', { home: 1, away: 0, points: 3 }),
        match('2', 'finished', { home: 2, away: 1, points: 5 }),
      ],
    })
    render(<ProfilePredictionsFeed userId="42" />)

    // Neutral label (not the home "Pronosticaste"), once per card.
    expect(screen.getAllByText(/Pronóstico/)).toHaveLength(2)
    // The live entry surfaces its in-progress badge.
    expect(screen.getByText(/En vivo/i)).toBeInTheDocument()
  })

  it('loads the next page when "Ver más" is clicked', async () => {
    const user = userEvent.setup()
    mockFeed({
      entries: [match('1', 'finished', { home: 1, away: 0, points: 0 })],
      hasNextPage: true,
    })
    render(<ProfilePredictionsFeed userId="42" />)

    await user.click(screen.getByRole('button', { name: 'Ver más' }))
    expect(fetchNextPage).toHaveBeenCalled()
  })
})
