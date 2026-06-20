import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProfileTournamentPredictionBlock } from '@/features/users/components/ProfileTournamentPredictionBlock'
import type { MatchTeam } from '@/features/matches/types'

function team(name: string): MatchTeam {
  return { id: name, name, code3: name.slice(0, 3).toUpperCase(), flagUrl: null }
}

describe('ProfileTournamentPredictionBlock', () => {
  it('shows the reveal message while the gate is closed', () => {
    render(
      <ProfileTournamentPredictionBlock
        prediction={{ available: false, reason: 'tournament_not_started' }}
      />,
    )
    expect(
      screen.getByText(/Se revela cuando arranca el Mundial/),
    ).toBeInTheDocument()
  })

  it('says the user did not predict when revealed but empty', () => {
    render(
      <ProfileTournamentPredictionBlock
        prediction={{ available: true, podium: null }}
      />,
    )
    expect(screen.getByText(/No pronosticó el torneo/)).toBeInTheDocument()
  })

  it('renders the podium + scorer when a pick is revealed', () => {
    render(
      <ProfileTournamentPredictionBlock
        prediction={{
          available: true,
          podium: {
            champion: team('Argentina'),
            runnerUp: team('Brasil'),
            thirdPlace: null,
            fourthPlace: null,
            topScorer: {
              id: '99',
              name: 'Messi',
              externalId: null,
              teamId: 'Argentina',
              team: team('Argentina'),
            },
          },
        }}
      />,
    )

    expect(screen.getByText('Argentina')).toBeInTheDocument()
    expect(screen.getByText('Brasil')).toBeInTheDocument()
    expect(screen.getByText('Messi')).toBeInTheDocument()
    expect(screen.getByText('Goleador')).toBeInTheDocument()
    // Unset podium spots fall back to an em dash.
    expect(screen.getAllByText('—').length).toBe(2)
  })
})
