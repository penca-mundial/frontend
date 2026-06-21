import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EliminationView } from '@/components/matches/EliminationView'
import type {
  BracketMatch,
  Match,
  MatchPhase,
} from '@/features/matches/types'

vi.mock('@/features/matches/hooks/useBracket', () => ({ useBracket: vi.fn() }))
vi.mock('@/features/tournament-predictions/hooks/useTournament', () => ({
  useTournament: vi.fn(),
}))

import { useBracket } from '@/features/matches/hooks/useBracket'
import { useTournament } from '@/features/tournament-predictions/hooks/useTournament'

const useBracketMock = vi.mocked(useBracket)
const useTournamentMock = vi.mocked(useTournament)

const URU = { id: '1', name: 'Uruguay', code3: 'URU', flagUrl: null }
const ARG = { id: '2', name: 'Argentina', code3: 'ARG', flagUrl: null }
const BRA = { id: '3', name: 'Brasil', code3: 'BRA', flagUrl: null }
const FRA = { id: '4', name: 'Francia', code3: 'FRA', flagUrl: null }

function makeMatch(
  id: string,
  phase: MatchPhase,
  overrides: Partial<Match> = {},
): Match {
  return {
    id,
    externalId: null,
    tournamentId: '1',
    kickoffAt: '2026-07-01T18:00:00Z',
    status: 'scheduled',
    phase,
    group: null,
    minute: null,
    homeScore: null,
    awayScore: null,
    advancingTeamId: null,
    homeTeam: URU,
    awayTeam: ARG,
    myPrediction: null,
    ...overrides,
  }
}

function bracketMatch(id: string, phase: MatchPhase): BracketMatch {
  return {
    id,
    phase,
    status: 'scheduled',
    kickoffAt: '2026-07-04T18:00:00Z',
    minute: null,
    homeScore: null,
    awayScore: null,
    advancingTeamId: null,
    homeTeam: URU,
    awayTeam: ARG,
    feedsIntoMatchId: null,
    feedsIntoSlot: null,
    bracketPosition: 0,
    myPrediction: null,
  }
}

function renderView(matches: Match[]) {
  // The list view renders MatchCardExpandable (uses a mutation hook), so a
  // QueryClient is required even with the bracket hooks mocked.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <EliminationView
        matches={matches}
        predictions={new Map()}
        timezone="UTC"
      />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  useTournamentMock.mockReturnValue({
    data: { id: '1' },
    isLoading: false,
  } as unknown as ReturnType<typeof useTournament>)
  useBracketMock.mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useBracket>)
})

describe('EliminationView', () => {
  it('shows the empty state when there are no knockout matches', () => {
    renderView([makeMatch('g1', 'group_stage')])
    expect(
      screen.getByText(/Las eliminatorias se publican cuando se confirmen/i),
    ).toBeInTheDocument()
  })

  it('lists knockout matches by default and toggles to the data-driven bracket', async () => {
    const user = userEvent.setup()
    useBracketMock.mockReturnValue({
      data: [bracketMatch('r16', 'round_of_16')],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useBracket>)

    renderView([makeMatch('r16', 'round_of_16')])

    // List view by default.
    expect(screen.getByText('Uruguay')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Ver cuadro/ }))

    expect(
      screen.getByRole('button', { name: /Ver lista/ }),
    ).toBeInTheDocument()
    // Bracket renders the round column (from the dedicated endpoint).
    expect(screen.getAllByText('Octavos').length).toBeGreaterThan(0)
  })

  it('filters the list by sub-phase', async () => {
    const user = userEvent.setup()
    renderView([
      makeMatch('r16', 'round_of_16'),
      makeMatch('qf', 'quarter_final', { homeTeam: BRA, awayTeam: FRA }),
    ])
    expect(screen.getByText('Uruguay')).toBeInTheDocument()
    expect(screen.getByText('Brasil')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cuartos' }))

    expect(screen.queryByText('Uruguay')).not.toBeInTheDocument()
    expect(screen.getByText('Brasil')).toBeInTheDocument()
  })
})
