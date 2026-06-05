import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GroupStandingsCard } from '@/features/matches/components/GroupStandingsCard'
import type { Match, Standing } from '@/features/matches/types'

const URU = { id: '1', name: 'Uruguay', code3: 'URU', flagUrl: null }
const ARG = { id: '2', name: 'Argentina', code3: 'ARG', flagUrl: null }

function standing(overrides: Partial<Standing>): Standing {
  return {
    id: 's',
    group: 'A',
    position: 1,
    playedGames: 0,
    won: 0,
    draw: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: null,
    team: URU,
    ...overrides,
  }
}

function match(id: string): Match {
  return {
    id,
    externalId: null,
    tournamentId: '1',
    kickoffAt: '2026-06-12T19:00:00Z',
    status: 'scheduled',
    phase: 'group_stage',
    group: 'A',
    minute: null,
    homeScore: null,
    awayScore: null,
    advancingTeamId: null,
    homeTeam: URU,
    awayTeam: ARG,
    myPrediction: null,
  }
}

describe('GroupStandingsCard', () => {
  it('renders the standings rows from the endpoint in the order given', () => {
    render(
      <GroupStandingsCard
        groupLetter="A"
        standings={[
          standing({ id: 's1', position: 1, team: URU, points: 7, goalDifference: 3 }),
          standing({ id: 's2', position: 2, team: ARG, points: 1, goalDifference: -3 }),
        ]}
        matches={[]}
      />,
    )

    // The group title + played-count badge live in the table header.
    expect(screen.getByText('Grupo A')).toBeInTheDocument()
    expect(screen.getByText('0 / 0 jugados')).toBeInTheDocument()
    const rows = screen.getAllByRole('row').slice(1) // drop the header row

    const row0 = within(rows[0]).getAllByRole('cell')
    expect(row0[0]).toHaveTextContent('1') // position
    expect(row0.at(-1)).toHaveTextContent('7') // points (last cell)
    expect(within(rows[0]).getByText('Uruguay')).toBeInTheDocument()
    expect(within(rows[0]).getByText('+3')).toBeInTheDocument()

    const row1 = within(rows[1]).getAllByRole('cell')
    expect(row1[0]).toHaveTextContent('2')
    expect(row1.at(-1)).toHaveTextContent('1')
    expect(within(rows[1]).getByText('Argentina')).toBeInTheDocument()
    expect(within(rows[1]).getByText('-3')).toBeInTheDocument()
  })

  it('shows the group match count in the collapsible toggle', () => {
    render(
      <GroupStandingsCard
        groupLetter="A"
        standings={[standing({ team: URU })]}
        matches={[match('m1')]}
      />,
    )
    expect(screen.getByText(/1 partido del grupo/)).toBeInTheDocument()
  })
})
