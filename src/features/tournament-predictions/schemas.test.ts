import { describe, expect, it } from 'vitest'
import { tournamentPredictionSchema } from '@/features/tournament-predictions/schemas'

const base = {
  championId: null,
  runnerUpId: null,
  thirdPlaceId: null,
  fourthPlaceId: null,
  topScorerId: null,
}

describe('tournamentPredictionSchema', () => {
  it('accepts an empty (all-null) prediction', () => {
    expect(tournamentPredictionSchema.safeParse(base).success).toBe(true)
  })

  it('accepts distinct podium picks', () => {
    expect(
      tournamentPredictionSchema.safeParse({
        championId: '1',
        runnerUpId: '2',
        thirdPlaceId: '3',
        fourthPlaceId: '4',
        topScorerId: '9',
      }).success,
    ).toBe(true)
  })

  it('rejects the same team in two podium spots', () => {
    expect(
      tournamentPredictionSchema.safeParse({
        ...base,
        championId: '1',
        runnerUpId: '1',
      }).success,
    ).toBe(false)
  })

  it('ignores nulls when checking distinctness', () => {
    expect(
      tournamentPredictionSchema.safeParse({ ...base, championId: '1' }).success,
    ).toBe(true)
  })
})
