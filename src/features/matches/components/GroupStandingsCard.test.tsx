import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GroupStandingsCard } from '@/features/matches/components/GroupStandingsCard'
import type { Match } from '@/features/matches/types'

const URU = { id: '1', name: 'Uruguay', code3: 'URU', flagUrl: null }
const ARG = { id: '2', name: 'Argentina', code3: 'ARG', flagUrl: null }

function match(overrides: Partial<Match> = {}): Match {
  return {
    id: 'm1',
    externalId: null,
    tournamentId: '1',
    kickoffAt: '2026-06-12T19:00:00Z',
    status: 'finished',
    phase: 'group_stage',
    homeScore: 2,
    awayScore: 0,
    advancingTeamId: null,
    homeTeam: URU,
    awayTeam: ARG,
    myPrediction: null,
    ...overrides,
  }
}

describe('GroupStandingsCard', () => {
  it('computes standings from finished matches (3-1-0 points)', () => {
    render(<GroupStandingsCard groupLetter="A" matches={[match()]} />)

    expect(screen.getByText('Grupo A')).toBeInTheDocument()
    expect(screen.getByText('1 / 1 jugados')).toBeInTheDocument()

    const rows = screen.getAllByRole('row').slice(1) // drop the header row
    // Winner (Uruguay, +2) is sorted above the loser (Argentina, -2).
    expect(within(rows[0]).getByText('Uruguay')).toBeInTheDocument()
    expect(within(rows[0]).getByText('+2')).toBeInTheDocument()
    expect(within(rows[0]).getByText('3')).toBeInTheDocument() // points
    expect(within(rows[1]).getByText('Argentina')).toBeInTheDocument()
  })

  it('ignores unfinished matches in the standings', () => {
    render(
      <GroupStandingsCard
        groupLetter="B"
        matches={[match({ status: 'scheduled', homeScore: null, awayScore: null })]}
      />,
    )
    expect(screen.getByText('0 / 1 jugados')).toBeInTheDocument()
  })
})
