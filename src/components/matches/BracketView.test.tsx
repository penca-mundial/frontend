import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BracketView } from '@/components/matches/BracketView'
import type { BracketMatch, MatchPhase } from '@/features/matches/types'

const URU = { id: '1', name: 'Uruguay', code3: 'URU', flagUrl: null }
const ARG = { id: '2', name: 'Argentina', code3: 'ARG', flagUrl: null }

function bm(
  overrides: Partial<BracketMatch> & { id: string; phase: MatchPhase },
): BracketMatch {
  return {
    status: 'scheduled',
    kickoffAt: '2026-07-12T18:00:00Z',
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
    ...overrides,
  }
}

describe('BracketView', () => {
  it('shows the empty state when there are no matches', () => {
    render(<BracketView matches={[]} />)
    expect(
      screen.getByText(/Las eliminatorias se publican cuando se confirmen/i),
    ).toBeInTheDocument()
  })

  it('renders the round label and both teams', () => {
    render(<BracketView matches={[bm({ id: 'f', phase: 'final' })]} />)
    // Mobile + desktop both render, so names appear more than once.
    expect(screen.getAllByText('Final').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Uruguay').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Argentina').length).toBeGreaterThan(0)
  })

  it('shows the score for a finished match', () => {
    render(
      <BracketView
        matches={[
          bm({
            id: 'f',
            phase: 'final',
            status: 'finished',
            homeScore: 2,
            awayScore: 1,
            advancingTeamId: '1',
          }),
        ]}
      />,
    )
    expect(screen.getAllByText('2').length).toBeGreaterThan(0)
    expect(screen.getAllByText('1').length).toBeGreaterThan(0)
  })

  it('shows the live score and a live tag for a live match', () => {
    render(
      <BracketView
        matches={[
          bm({
            id: 'f',
            phase: 'final',
            status: 'live',
            minute: 67,
            homeScore: 1,
            awayScore: 0,
          }),
        ]}
      />,
    )
    expect(screen.getAllByText(/Vivo/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText('1').length).toBeGreaterThan(0)
  })

  it('tints my advance pick green when I got it right', () => {
    const { container } = render(
      <BracketView
        matches={[
          bm({
            id: 'f',
            phase: 'final',
            status: 'finished',
            homeScore: 2,
            awayScore: 1,
            advancingTeamId: '1', // URU advanced
            myPrediction: {
              id: 'p',
              matchId: 'f',
              predictedHomeScore: 1,
              predictedAwayScore: 0,
              predictedAdvancingTeamId: '1', // I picked URU
              locked: true,
              pointsEarned: 5,
            },
          }),
        ]}
      />,
    )
    expect(container.querySelector('.bg-success-soft')).not.toBeNull()
    expect(container.querySelector('.bg-danger-soft')).toBeNull()
  })

  it('tints my advance pick red when I got it wrong', () => {
    const { container } = render(
      <BracketView
        matches={[
          bm({
            id: 'f',
            phase: 'final',
            status: 'finished',
            homeScore: 0,
            awayScore: 2,
            advancingTeamId: '2', // ARG advanced
            myPrediction: {
              id: 'p',
              matchId: 'f',
              predictedHomeScore: 1,
              predictedAwayScore: 0,
              predictedAdvancingTeamId: '1', // I picked URU
              locked: true,
              pointsEarned: 0,
            },
          }),
        ]}
      />,
    )
    expect(container.querySelector('.bg-danger-soft')).not.toBeNull()
    expect(container.querySelector('.bg-success-soft')).toBeNull()
  })

  it('renders third place apart from the tree', () => {
    render(
      <BracketView
        matches={[
          bm({ id: 'f', phase: 'final' }),
          bm({ id: 'tp', phase: 'third_place', bracketPosition: null }),
        ]}
      />,
    )
    expect(screen.getByText('Tercer puesto')).toBeInTheDocument()
  })
})
