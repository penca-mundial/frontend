import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { MatchCard } from '@/features/matches/components/MatchCard'
import type { Match } from '@/features/matches/types'

function makeMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: '10',
    externalId: null,
    tournamentId: '1',
    kickoffAt: '2099-06-12T19:00:00Z',
    status: 'scheduled',
    phase: 'group_stage',
    homeScore: null,
    awayScore: null,
    advancingTeamId: null,
    homeTeam: { id: '1', name: 'Uruguay', code3: 'URU', flagUrl: null },
    awayTeam: { id: '2', name: 'Argentina', code3: 'ARG', flagUrl: null },
    myPrediction: null,
    ...overrides,
  }
}

function renderCard(match: Match) {
  return render(
    <MemoryRouter>
      <MatchCard match={match} timezone="UTC" />
    </MemoryRouter>,
  )
}

describe('MatchCard', () => {
  it('links to the match detail page', () => {
    renderCard(makeMatch())
    expect(screen.getByRole('link')).toHaveAttribute('href', '/app/matches/10')
  })

  it('shows an "Abierto" status for a schedulable match', () => {
    renderCard(makeMatch())
    expect(screen.getByText('Abierto')).toBeInTheDocument()
  })

  it('shows "En vivo" and the live score', () => {
    renderCard(makeMatch({ status: 'live', homeScore: 1, awayScore: 0 }))
    expect(screen.getByText('En vivo')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('renders the phase label and the user prediction', () => {
    renderCard(
      makeMatch({
        phase: 'round_of_32',
        myPrediction: {
          id: 'p',
          matchId: '10',
          predictedHomeScore: 3,
          predictedAwayScore: 2,
          predictedAdvancingTeamId: '1',
          lockedAt: null,
          locked: false,
        },
      }),
    )
    expect(screen.getByText('Dieciseisavos')).toBeInTheDocument()
    expect(screen.getByText('3-2')).toBeInTheDocument()
  })
})
