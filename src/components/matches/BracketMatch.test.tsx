import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BracketMatch } from '@/components/matches/BracketMatch'
import type { Match } from '@/features/matches/types'

function makeMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: '1',
    externalId: null,
    tournamentId: '1',
    kickoffAt: '2099-06-12T19:00:00Z',
    status: 'scheduled',
    phase: 'round_of_32',
    homeScore: null,
    awayScore: null,
    advancingTeamId: null,
    homeTeam: { id: '1', name: 'Uruguay', code3: 'URU', flagUrl: null },
    awayTeam: { id: '2', name: 'Argentina', code3: 'ARG', flagUrl: null },
    myPrediction: null,
    ...overrides,
  }
}

describe('BracketMatch', () => {
  it('shows both team names when scheduled, without scores', () => {
    render(<BracketMatch match={makeMatch()} />)
    expect(screen.getByText('Uruguay')).toBeInTheDocument()
    expect(screen.getByText('Argentina')).toBeInTheDocument()
  })

  it('shows "Por definir" for an undetermined team', () => {
    render(<BracketMatch match={makeMatch({ awayTeam: null })} />)
    expect(screen.getByText('Por definir')).toBeInTheDocument()
  })

  it('shows the real score and emphasises the winner once finished', () => {
    render(
      <BracketMatch
        match={makeMatch({
          status: 'finished',
          homeScore: 2,
          awayScore: 1,
          advancingTeamId: '1',
        })}
      />,
    )
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('Uruguay').closest('div')).toHaveClass(
      'font-semibold',
    )
  })

  it('flags a correct advancing-team prediction', () => {
    render(
      <BracketMatch
        match={makeMatch({
          status: 'finished',
          homeScore: 2,
          awayScore: 1,
          advancingTeamId: '1',
          myPrediction: {
            id: 'p',
            matchId: '1',
            predictedHomeScore: 2,
            predictedAwayScore: 1,
            predictedAdvancingTeamId: '1',
            lockedAt: null,
            locked: true,
          },
        })}
      />,
    )
    expect(screen.getByLabelText('Acertaste el pronóstico')).toBeInTheDocument()
  })

  it('routes on tap when onSelect is provided', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const match = makeMatch()
    render(<BracketMatch match={match} onSelect={onSelect} />)

    await user.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledWith(match)
  })
})
