import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HomeTournamentPredictionCard } from '@/features/tournament-predictions/components/HomeTournamentPredictionCard'
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
vi.mock(
  '@/features/tournament-predictions/hooks/useTournamentPrediction',
  () => ({ useTournamentPrediction: vi.fn() }),
)

import { useTournament } from '@/features/tournament-predictions/hooks/useTournament'
import { useTeams } from '@/features/tournament-predictions/hooks/useTeams'
import { usePlayers } from '@/features/tournament-predictions/hooks/usePlayers'
import { useTournamentPrediction } from '@/features/tournament-predictions/hooks/useTournamentPrediction'

const useTournamentMock = vi.mocked(useTournament)
const useTeamsMock = vi.mocked(useTeams)
const usePlayersMock = vi.mocked(usePlayers)
const usePredictionMock = vi.mocked(useTournamentPrediction)

const ARG: MatchTeam = {
  id: '1',
  name: 'Argentina',
  code3: 'ARG',
  flagUrl: 'https://flags/arg.png',
}
const FRA: MatchTeam = {
  id: '2',
  name: 'Francia',
  code3: 'FRA',
  flagUrl: 'https://flags/fra.png',
}
const TEAMS = [ARG, FRA]
const PLAYERS: Player[] = [
  { id: '9', name: 'Lionel Messi', externalId: 'e9', teamId: '1', team: ARG },
]

const tournament: Tournament = {
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
  secondsUntilKickoff: 3600,
}

const prediction: TournamentPrediction = {
  id: 'p1',
  tournamentId: '1',
  championId: '1',
  runnerUpId: '2',
  thirdPlaceId: null,
  fourthPlaceId: null,
  topScorerId: '9',
  lockedAt: null,
  locked: false,
}

function setup(options: {
  loading?: boolean
  tournamentOverrides?: Partial<Tournament>
  prediction?: TournamentPrediction | null
}) {
  const loading = options.loading ?? false
  useTournamentMock.mockReturnValue({
    data: loading ? undefined : { ...tournament, ...options.tournamentOverrides },
    isLoading: loading,
  } as unknown as ReturnType<typeof useTournament>)
  useTeamsMock.mockReturnValue({
    data: loading ? undefined : TEAMS,
    isLoading: loading,
  } as unknown as ReturnType<typeof useTeams>)
  usePlayersMock.mockReturnValue({
    data: loading ? undefined : PLAYERS,
    isLoading: loading,
  } as unknown as ReturnType<typeof usePlayers>)
  usePredictionMock.mockReturnValue({
    query: {
      data: loading ? undefined : (options.prediction ?? null),
      isLoading: loading,
    },
    upsert: { mutateAsync: vi.fn() },
  } as unknown as ReturnType<typeof useTournamentPrediction>)
}

function renderCard() {
  return render(
    <MemoryRouter>
      <HomeTournamentPredictionCard />
    </MemoryRouter>,
  )
}

beforeEach(() => vi.clearAllMocks())

describe('HomeTournamentPredictionCard', () => {
  it('shows a skeleton while loading (no link yet)', () => {
    setup({ loading: true })
    const { container } = renderCard()

    expect(screen.getByText('Pronóstico del torneo')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('invites to create a prediction when there is none', () => {
    setup({ prediction: null })
    renderCard()

    expect(
      screen.getByText(/Todavía no armaste tu pronóstico/i),
    ).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /Armá el tuyo/ })
    expect(link).toHaveAttribute('href', '/app/predictions/tournament')
    expect(screen.queryByText('Bloqueado')).not.toBeInTheDocument()
  })

  it('shows the full podium + scorer, a Bloqueado badge, and a Ver/editar link when locked', () => {
    setup({ prediction, tournamentOverrides: { isLocked: true } })
    renderCard()

    // Mock layout: all five role labels on the right, full podium + scorer.
    expect(screen.getByText('Campeón')).toBeInTheDocument()
    expect(screen.getByText('Subcampeón')).toBeInTheDocument()
    expect(screen.getByText('Tercer puesto')).toBeInTheDocument()
    expect(screen.getByText('Cuarto puesto')).toBeInTheDocument()
    expect(screen.getByText('Goleador')).toBeInTheDocument()
    // Resolved picks (champion ARG, runner-up FRA, scorer Messi); unset → "—".
    expect(screen.getByText('Argentina')).toBeInTheDocument()
    expect(screen.getByText('Francia')).toBeInTheDocument()
    expect(screen.getByText('Lionel Messi')).toBeInTheDocument()
    expect(screen.getAllByText('—')).toHaveLength(2)

    expect(screen.getByText('Bloqueado')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /Ver\/editar/ })
    expect(link).toHaveAttribute('href', '/app/predictions/tournament')
  })
})
