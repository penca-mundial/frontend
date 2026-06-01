import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  COMPACT_SUMMARY_SPOTS,
  TournamentPredictionSummary,
} from '@/features/tournament-predictions/components/TournamentPredictionSummary'
import type { MatchTeam } from '@/features/matches/types'
import type {
  Player,
  TournamentPrediction,
} from '@/features/tournament-predictions/types'

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
const BRA: MatchTeam = {
  id: '3',
  name: 'Brasil',
  code3: 'BRA',
  flagUrl: 'https://flags/bra.png',
}
const URU: MatchTeam = {
  id: '4',
  name: 'Uruguay',
  code3: 'URU',
  flagUrl: 'https://flags/uru.png',
}
const TEAMS = [ARG, FRA, BRA, URU]

const PLAYERS: Player[] = [
  { id: '9', name: 'Lionel Messi', externalId: 'e9', teamId: '1', team: ARG },
]

const prediction: TournamentPrediction = {
  id: 'p1',
  tournamentId: '1',
  championId: '1',
  runnerUpId: '2',
  thirdPlaceId: '3',
  fourthPlaceId: '4',
  topScorerId: '9',
  lockedAt: null,
  locked: false,
}

/** The flag <img> sits next to a name; assert by src since it's decorative. */
function flagSrcFor(name: string): string | null {
  const row = screen.getByText(name).closest('dd')
  return row?.querySelector('img')?.getAttribute('src') ?? null
}

describe('TournamentPredictionSummary', () => {
  it('renders the full podium + top scorer with flags by default', () => {
    render(
      <TournamentPredictionSummary
        prediction={prediction}
        teams={TEAMS}
        players={PLAYERS}
      />,
    )

    expect(screen.getByText('Campeón')).toBeInTheDocument()
    expect(screen.getByText('Subcampeón')).toBeInTheDocument()
    expect(screen.getByText('Tercer puesto')).toBeInTheDocument()
    expect(screen.getByText('Cuarto puesto')).toBeInTheDocument()
    expect(screen.getByText('Goleador')).toBeInTheDocument()

    expect(screen.getByText('Argentina')).toBeInTheDocument()
    expect(screen.getByText('Lionel Messi')).toBeInTheDocument()

    // Flags resolve from teams (podium) and the player's team (scorer).
    expect(flagSrcFor('Argentina')).toBe('https://flags/arg.png')
    expect(flagSrcFor('Brasil')).toBe('https://flags/bra.png')
    expect(flagSrcFor('Lionel Messi')).toBe('https://flags/arg.png')
    // Decorative: no accessible name leaks from the flag.
    const flag = screen.getByText('Argentina').closest('dd')?.querySelector('img')
    expect(flag).toHaveAttribute('alt', '')
    expect(flag).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders only the compact set when asked (champion + runner-up + scorer)', () => {
    render(
      <TournamentPredictionSummary
        prediction={prediction}
        teams={TEAMS}
        players={PLAYERS}
        spots={COMPACT_SUMMARY_SPOTS}
      />,
    )

    expect(screen.getByText('Campeón')).toBeInTheDocument()
    expect(screen.getByText('Subcampeón')).toBeInTheDocument()
    expect(screen.getByText('Goleador')).toBeInTheDocument()
    // 3rd/4th are omitted in the compact set.
    expect(screen.queryByText('Tercer puesto')).not.toBeInTheDocument()
    expect(screen.queryByText('Cuarto puesto')).not.toBeInTheDocument()
    expect(screen.queryByText('Brasil')).not.toBeInTheDocument()
    expect(screen.queryByText('Uruguay')).not.toBeInTheDocument()

    expect(flagSrcFor('Argentina')).toBe('https://flags/arg.png')
    expect(flagSrcFor('Lionel Messi')).toBe('https://flags/arg.png')
  })

  it('renders "—" for an unpicked spot', () => {
    render(
      <TournamentPredictionSummary
        prediction={{ ...prediction, runnerUpId: null }}
        teams={TEAMS}
        players={PLAYERS}
        spots={['runnerUpId']}
      />,
    )
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
