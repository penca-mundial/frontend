import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TournamentPredictionPage } from '@/pages/app/TournamentPredictionPage'
import type { MatchTeam } from '@/features/matches/types'
import type {
  Player,
  Tournament,
  TournamentPrediction,
} from '@/features/tournament-predictions/types'

vi.mock('@/features/tournament-predictions/hooks/useTournament', () => ({
  useTournament: vi.fn(),
}))
vi.mock('@/features/tournament-predictions/hooks/useTeams', () => ({
  useTeams: vi.fn(),
}))
vi.mock('@/features/tournament-predictions/hooks/usePlayers', () => ({
  usePlayers: vi.fn(),
}))
vi.mock('@/features/tournament-predictions/hooks/useTournamentPrediction', () => ({
  useTournamentPrediction: vi.fn(),
}))
vi.mock('@/features/tournament-predictions/hooks/useCountdown', () => ({
  useCountdown: vi.fn(),
}))

import { useTournament } from '@/features/tournament-predictions/hooks/useTournament'
import { useTeams } from '@/features/tournament-predictions/hooks/useTeams'
import { usePlayers } from '@/features/tournament-predictions/hooks/usePlayers'
import { useTournamentPrediction } from '@/features/tournament-predictions/hooks/useTournamentPrediction'
import { useCountdown } from '@/features/tournament-predictions/hooks/useCountdown'

const useTournamentMock = vi.mocked(useTournament)
const useTeamsMock = vi.mocked(useTeams)
const usePlayersMock = vi.mocked(usePlayers)
const usePredictionMock = vi.mocked(useTournamentPrediction)
const useCountdownMock = vi.mocked(useCountdown)

const TEAMS: MatchTeam[] = [
  { id: '1', name: 'Uruguay', code3: 'URU', flagUrl: null },
  { id: '2', name: 'Argentina', code3: 'ARG', flagUrl: null },
]
const PLAYERS: Player[] = [
  { id: '9', name: 'Luis Suárez', externalId: 'e9', teamId: '1', team: null },
]

function tournament(overrides: Partial<Tournament> = {}): Tournament {
  return {
    id: '1',
    name: 'Mundial 2026',
    startsAt: '2026-06-11T00:00:00Z',
    endsAt: null,
    externalCode: null,
    championId: null,
    runnerUpId: null,
    thirdPlaceId: null,
    fourthPlaceId: null,
    topScorerId: null,
    isLocked: false,
    secondsUntilKickoff: 3661,
    ...overrides,
  }
}

function setup(options: {
  tournament: Tournament
  prediction: TournamentPrediction | null
  countdown?: number
}) {
  useTournamentMock.mockReturnValue({
    data: options.tournament,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useTournament>)
  useTeamsMock.mockReturnValue({
    data: TEAMS,
  } as unknown as ReturnType<typeof useTeams>)
  usePlayersMock.mockReturnValue({
    data: PLAYERS,
  } as unknown as ReturnType<typeof usePlayers>)
  usePredictionMock.mockReturnValue({
    query: { data: options.prediction, isLoading: false },
    upsert: { mutateAsync: vi.fn() },
  } as unknown as ReturnType<typeof useTournamentPrediction>)
  useCountdownMock.mockReturnValue(options.countdown ?? 3661)
}

beforeEach(() => vi.clearAllMocks())

describe('TournamentPredictionPage', () => {
  it('shows the editable form with a live countdown when open', () => {
    setup({ tournament: tournament({ isLocked: false }), prediction: null, countdown: 3661 })
    render(<TournamentPredictionPage />)

    expect(screen.getByText('Cierra en')).toBeInTheDocument()
    expect(screen.getByText('1h 01m 01s')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Guardar pronóstico/ }),
    ).toBeInTheDocument()
  })

  it('shows the read-only prediction (no form) when locked', () => {
    setup({
      tournament: tournament({ isLocked: true }),
      prediction: {
        id: 'p1',
        tournamentId: '1',
        championId: '1',
        runnerUpId: null,
        thirdPlaceId: null,
        fourthPlaceId: null,
        topScorerId: '9',
        lockedAt: '2026-06-11T00:00:00Z',
        locked: true,
      },
    })
    render(<TournamentPredictionPage />)

    expect(
      screen.getByText(/Los pronósticos del torneo están cerrados/i),
    ).toBeInTheDocument()
    expect(screen.getByText('Uruguay')).toBeInTheDocument() // champion, read-only
    expect(screen.getByText('Luis Suárez')).toBeInTheDocument() // top scorer
    expect(
      screen.queryByRole('button', { name: /Guardar pronóstico/ }),
    ).not.toBeInTheDocument()
  })
})
