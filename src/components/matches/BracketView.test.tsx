import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BracketView } from '@/components/matches/BracketView'
import type { Match } from '@/features/matches/types'
import { buildBracketRounds } from '@/features/matches/utils'

function makeMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: Math.random().toString(36).slice(2),
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

describe('BracketView', () => {
  it('renders a column per round with rioplatense phase labels', () => {
    const rounds = buildBracketRounds([
      makeMatch({ phase: 'round_of_32' }),
      makeMatch({ phase: 'final' }),
    ])
    render(<BracketView rounds={rounds} />)

    expect(
      screen.getByRole('heading', { name: 'Dieciseisavos' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Final' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Dieciseisavos' })).toBeInTheDocument()
  })

  it('renders an empty-state message when there are no rounds', () => {
    render(<BracketView rounds={[]} />)
    expect(
      screen.getByText(/cuadro de eliminación todavía no está disponible/i),
    ).toBeInTheDocument()
  })

  it('makes matches tappable when onSelectMatch is provided', () => {
    const rounds = buildBracketRounds([makeMatch({ phase: 'final' })])
    render(<BracketView rounds={rounds} onSelectMatch={() => {}} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
