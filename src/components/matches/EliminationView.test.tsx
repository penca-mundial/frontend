import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EliminationView } from '@/components/matches/EliminationView'
import type { BracketMatch, MatchPhase } from '@/features/matches/types'

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

function mockBracket(state: {
  data?: BracketMatch[]
  isLoading?: boolean
  isError?: boolean
}) {
  useBracketMock.mockReturnValue({
    data: state.data,
    isLoading: state.isLoading ?? false,
    isError: state.isError ?? false,
  } as unknown as ReturnType<typeof useBracket>)
}

beforeEach(() => {
  vi.clearAllMocks()
  useTournamentMock.mockReturnValue({
    data: { id: '1' },
    isLoading: false,
  } as unknown as ReturnType<typeof useTournament>)
})

describe('EliminationView', () => {
  it('renders the data-driven bracket from the endpoint (no list / toggle)', () => {
    mockBracket({ data: [bracketMatch('r16', 'round_of_16')] })
    render(<EliminationView />)

    expect(screen.getAllByText('Octavos').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Uruguay').length).toBeGreaterThan(0)
    // The old list/cuadro toggle is gone.
    expect(
      screen.queryByRole('button', { name: /Ver cuadro|Ver lista/ }),
    ).not.toBeInTheDocument()
  })

  it('shows a skeleton while the bracket loads', () => {
    mockBracket({ isLoading: true })
    const { container } = render(<EliminationView />)
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull()
  })

  it('shows an error message on failure', () => {
    mockBracket({ isError: true })
    render(<EliminationView />)
    expect(screen.getByText(/No pudimos cargar el cuadro/i)).toBeInTheDocument()
  })

  it('shows the empty-state when there are no knockout matches yet', () => {
    mockBracket({ data: [] })
    render(<EliminationView />)
    expect(
      screen.getByText(/Las eliminatorias se publican cuando se confirmen/i),
    ).toBeInTheDocument()
  })
})
