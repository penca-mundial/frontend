import { describe, expect, it } from 'vitest'
import type { Match } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'
import { predictionResultStatus } from '@/features/predictions/utils'

function prediction(home: number, away: number): Prediction {
  return {
    id: 'p',
    matchId: '1',
    predictedHomeScore: home,
    predictedAwayScore: away,
    predictedAdvancingTeamId: null,
    lockedAt: null,
    locked: true,
  }
}

function finishedMatch(home: number, away: number): Match {
  return {
    id: '1',
    externalId: null,
    tournamentId: '1',
    kickoffAt: '2020-01-01T00:00:00Z',
    status: 'finished',
    phase: 'group_stage',
    homeScore: home,
    awayScore: away,
    advancingTeamId: null,
    homeTeam: { id: '1', name: 'A', code3: null, flagUrl: null },
    awayTeam: { id: '2', name: 'B', code3: null, flagUrl: null },
    myPrediction: null,
  }
}

describe('predictionResultStatus', () => {
  it('is pending when the match is missing or unfinished', () => {
    expect(predictionResultStatus(prediction(1, 0), undefined)).toBe('pending')
    expect(
      predictionResultStatus(prediction(1, 0), {
        ...finishedMatch(1, 0),
        status: 'scheduled',
      }),
    ).toBe('pending')
  })

  it('is exact when the score matches', () => {
    expect(predictionResultStatus(prediction(2, 1), finishedMatch(2, 1))).toBe(
      'exact',
    )
  })

  it('is partial when the outcome is right but the score is not', () => {
    expect(predictionResultStatus(prediction(3, 1), finishedMatch(2, 0))).toBe(
      'partial',
    )
    expect(predictionResultStatus(prediction(1, 1), finishedMatch(2, 2))).toBe(
      'partial',
    )
  })

  it('is wrong when the outcome is wrong', () => {
    expect(predictionResultStatus(prediction(2, 0), finishedMatch(0, 1))).toBe(
      'wrong',
    )
  })
})
