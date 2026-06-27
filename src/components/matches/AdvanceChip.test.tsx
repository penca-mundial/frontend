import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AdvanceChip } from '@/components/matches/AdvanceChip'
import type { Match } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'

const URU = { id: '1', name: 'Uruguay', code3: 'URU', flagUrl: null }
const ARG = { id: '2', name: 'Argentina', code3: 'ARG', flagUrl: null }

// Finished knockout, Uruguay (id '1') advanced.
function match(over: Partial<Match> = {}): Match {
  return {
    id: '10',
    externalId: null,
    tournamentId: '1',
    kickoffAt: '2026-07-04T18:00:00Z',
    status: 'finished',
    phase: 'round_of_32',
    homeScore: 1,
    awayScore: 0,
    advancingTeamId: '1',
    homeTeam: URU,
    awayTeam: ARG,
    myPrediction: null,
    ...over,
  }
}

function pred(over: Partial<Prediction> = {}): Prediction {
  return {
    id: 'p',
    matchId: '10',
    predictedHomeScore: 1,
    predictedAwayScore: 0,
    predictedAdvancingTeamId: '1',
    lockedAt: null,
    locked: true,
    ...over,
  }
}

describe('AdvanceChip', () => {
  it('green "Avance <team>" when the advancing pick was right', () => {
    render(<AdvanceChip match={match()} prediction={pred({ predictedAdvancingTeamId: '1' })} />)
    const chip = screen.getByText(/Avance Uruguay/)
    expect(chip).toBeInTheDocument()
    expect(chip.className).toMatch(/success-soft/)
  })

  it('red chip naming the pick when it was wrong', () => {
    render(
      <AdvanceChip
        match={match({ advancingTeamId: '2' })}
        prediction={pred({ predictedAdvancingTeamId: '1' })}
      />,
    )
    const chip = screen.getByText(/Avance Uruguay/)
    expect(chip.className).toMatch(/danger-soft/)
  })

  it('renders nothing when there is no advancing pick', () => {
    const { container } = render(
      <AdvanceChip match={match()} prediction={pred({ predictedAdvancingTeamId: null })} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing for a group-stage match', () => {
    const { container } = render(
      <AdvanceChip
        match={match({ phase: 'group_stage', group: 'A', advancingTeamId: null })}
        prediction={pred()}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the amber "Tu pick" pending chip before the match is finished', () => {
    render(
      <AdvanceChip
        match={match({ status: 'scheduled', advancingTeamId: null })}
        prediction={pred()}
      />,
    )
    const chip = screen.getByText(/Tu pick: Uruguay pasa/)
    expect(chip).toBeInTheDocument()
    expect(chip.className).toMatch(/brand-accent-soft/)
  })

  it('shows the amber pending chip for a live knockout match', () => {
    render(
      <AdvanceChip
        match={match({ status: 'live', advancingTeamId: null })}
        prediction={pred()}
      />,
    )
    expect(screen.getByText(/Tu pick: Uruguay pasa/).className).toMatch(
      /brand-accent-soft/,
    )
  })

  it('still renders nothing for a group-stage match (no advance)', () => {
    const { container } = render(
      <AdvanceChip
        match={match({ phase: 'group_stage', status: 'live', advancingTeamId: null })}
        prediction={pred()}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
