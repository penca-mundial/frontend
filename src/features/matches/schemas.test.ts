import { describe, expect, it } from 'vitest'
import { predictionSchema } from '@/features/matches/schemas'

describe('predictionSchema', () => {
  it('accepts valid group-stage scores without an advancing team', () => {
    const result = predictionSchema(false).safeParse({
      homeScore: 2,
      awayScore: 1,
      advancingTeamId: null,
    })
    expect(result.success).toBe(true)
  })

  it('rejects scores out of the 0–20 range', () => {
    expect(
      predictionSchema(false).safeParse({
        homeScore: 21,
        awayScore: 0,
        advancingTeamId: null,
      }).success,
    ).toBe(false)
    expect(
      predictionSchema(false).safeParse({
        homeScore: -1,
        awayScore: 0,
        advancingTeamId: null,
      }).success,
    ).toBe(false)
  })

  it('requires an advancing team for knockout matches', () => {
    expect(
      predictionSchema(true).safeParse({
        homeScore: 1,
        awayScore: 0,
        advancingTeamId: null,
      }).success,
    ).toBe(false)
    expect(
      predictionSchema(true).safeParse({
        homeScore: 1,
        awayScore: 0,
        advancingTeamId: '1',
      }).success,
    ).toBe(true)
  })
})
