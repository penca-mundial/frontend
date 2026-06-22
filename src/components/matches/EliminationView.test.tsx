import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EliminationView } from '@/components/matches/EliminationView'
import type {
  BracketMatch,
  MatchPhase,
  ProjectedBracket,
} from '@/features/matches/types'

vi.mock('@/features/matches/hooks/useBracket', () => ({ useBracket: vi.fn() }))
vi.mock('@/features/matches/hooks/useProjectedBracket', () => ({
  useProjectedBracket: vi.fn(),
}))
vi.mock('@/features/tournament-predictions/hooks/useTournament', () => ({
  useTournament: vi.fn(),
}))
vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}))

import { useBracket } from '@/features/matches/hooks/useBracket'
import { useProjectedBracket } from '@/features/matches/hooks/useProjectedBracket'
import { useTournament } from '@/features/tournament-predictions/hooks/useTournament'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

const useBracketMock = vi.mocked(useBracket)
const useProjectedBracketMock = vi.mocked(useProjectedBracket)
const useTournamentMock = vi.mocked(useTournament)
const useCurrentUserMock = vi.mocked(useCurrentUser)

const URU = { id: '1', name: 'Uruguay', code3: 'URU', flagUrl: null }
const ARG = { id: '2', name: 'Argentina', code3: 'ARG', flagUrl: null }

function officialMatch(phase: MatchPhase): BracketMatch {
  return {
    id: 'm1',
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

function projected(value: ProjectedBracket | undefined, isLoading = false) {
  useProjectedBracketMock.mockReturnValue({
    data: value,
    isLoading,
    isError: false,
  } as unknown as ReturnType<typeof useProjectedBracket>)
}

function official(
  value: BracketMatch[] | undefined,
  state: { isLoading?: boolean; isError?: boolean } = {},
) {
  useBracketMock.mockReturnValue({
    data: value,
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
  useCurrentUserMock.mockReturnValue({
    currentUser: null,
  } as unknown as ReturnType<typeof useCurrentUser>)
  projected(undefined)
  official([officialMatch('round_of_16')])
})

describe('EliminationView', () => {
  it('anonymous → renders the official bracket (no projected note)', () => {
    render(<EliminationView />)
    expect(screen.getAllByText('Octavos').length).toBeGreaterThan(0)
    expect(screen.queryByText(/Según tus pronósticos/i)).not.toBeInTheDocument()
  })

  it('signed-in & projected:true → projected R32 + the "según tus pronósticos" note', () => {
    useCurrentUserMock.mockReturnValue({
      currentUser: { id: '9' },
    } as unknown as ReturnType<typeof useCurrentUser>)
    projected({
      projected: true,
      roundOf32: [{ bracketPosition: 0, home: URU, away: null, source: 'projected' }],
    })

    render(<EliminationView />)

    expect(screen.getByText(/Según tus pronósticos/i)).toBeInTheDocument()
    expect(screen.getAllByText('Dieciseisavos').length).toBeGreaterThan(0)
    expect(screen.getByText('Uruguay')).toBeInTheDocument()
    expect(screen.getAllByText('A definir').length).toBeGreaterThan(0)
  })

  it('signed-in & projected:false → falls back to the official bracket', () => {
    useCurrentUserMock.mockReturnValue({
      currentUser: { id: '9' },
    } as unknown as ReturnType<typeof useCurrentUser>)
    projected({ projected: false, roundOf32: [] })
    official([officialMatch('round_of_16')])

    render(<EliminationView />)

    expect(screen.getAllByText('Octavos').length).toBeGreaterThan(0)
    expect(screen.queryByText(/Según tus pronósticos/i)).not.toBeInTheDocument()
  })

  it('shows a skeleton while the signed-in projection is loading', () => {
    useCurrentUserMock.mockReturnValue({
      currentUser: { id: '9' },
    } as unknown as ReturnType<typeof useCurrentUser>)
    projected(undefined, true)

    const { container } = render(<EliminationView />)
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull()
  })

  it('shows an error when the official bracket fails (anonymous)', () => {
    official(undefined, { isError: true })
    render(<EliminationView />)
    expect(screen.getByText(/No pudimos cargar el cuadro/i)).toBeInTheDocument()
  })
})
