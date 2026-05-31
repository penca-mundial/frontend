import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PredictionLock } from '@/features/matches/components/PredictionLock'
import type { Match } from '@/features/matches/types'

function makeMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: '10',
    externalId: null,
    tournamentId: '1',
    kickoffAt: '2020-06-12T19:00:00Z',
    status: 'finished',
    phase: 'group_stage',
    homeScore: 2,
    awayScore: 1,
    advancingTeamId: null,
    homeTeam: { id: '1', name: 'Uruguay', code3: 'URU', flagUrl: null },
    awayTeam: { id: '2', name: 'Argentina', code3: 'ARG', flagUrl: null },
    myPrediction: null,
    ...overrides,
  }
}

describe('PredictionLock', () => {
  it('shows a no-prediction message with the result', () => {
    render(<PredictionLock match={makeMatch()} />)
    expect(screen.getByText('No pronosticaste este partido.')).toBeInTheDocument()
    expect(screen.getByText('Resultado 2-1')).toBeInTheDocument()
  })

  it('shows the prediction, the real result and an exact-score hit', () => {
    render(
      <PredictionLock
        match={makeMatch({
          myPrediction: {
            id: 'p',
            matchId: '10',
            predictedHomeScore: 2,
            predictedAwayScore: 1,
            predictedAdvancingTeamId: null,
            lockedAt: null,
            locked: true,
          },
        })}
      />,
    )
    expect(screen.getByText('Tu pronóstico')).toBeInTheDocument()
    expect(screen.getByText('Resultado')).toBeInTheDocument()
    expect(screen.getByText('✓ Resultado exacto')).toBeInTheDocument()
  })

  it('reports a missed exact score', () => {
    render(
      <PredictionLock
        match={makeMatch({
          myPrediction: {
            id: 'p',
            matchId: '10',
            predictedHomeScore: 0,
            predictedAwayScore: 0,
            predictedAdvancingTeamId: null,
            lockedAt: null,
            locked: true,
          },
        })}
      />,
    )
    expect(
      screen.getByText('No acertaste el resultado exacto'),
    ).toBeInTheDocument()
  })
})
