import { describe, expect, it } from 'vitest'
import type { Match } from '@/features/matches/types'
import {
  advancingPredictionOutcome,
  buildBracketRounds,
  getPhaseLabel,
  isKnockoutPhase,
  isMatchLocked,
} from '@/features/matches/utils'

function makeMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: '1',
    externalId: null,
    tournamentId: '1',
    kickoffAt: '2099-06-12T19:00:00Z',
    status: 'scheduled',
    phase: 'group_stage',
    homeScore: null,
    awayScore: null,
    advancingTeamId: null,
    homeTeam: { id: '1', name: 'Uruguay', code3: 'URU', flagUrl: null },
    awayTeam: { id: '2', name: 'Argentina', code3: 'ARG', flagUrl: null },
    myPrediction: null,
    ...overrides,
  }
}

describe('getPhaseLabel', () => {
  it('uses the rioplatense knockout names (round_of_32 = Dieciseisavos)', () => {
    expect(getPhaseLabel('round_of_32')).toBe('Dieciseisavos')
    expect(getPhaseLabel('round_of_16')).toBe('Octavos')
    expect(getPhaseLabel('group_stage')).toBe('Fase de grupos')
  })

  it('falls back to the raw value for unknown phases', () => {
    expect(getPhaseLabel('mystery')).toBe('mystery')
  })
})

describe('isKnockoutPhase', () => {
  it('treats every phase but the group stage as knockout', () => {
    expect(isKnockoutPhase('group_stage')).toBe(false)
    expect(isKnockoutPhase('round_of_32')).toBe(true)
    expect(isKnockoutPhase('final')).toBe(true)
  })
})

describe('isMatchLocked', () => {
  const now = new Date('2099-06-12T18:00:00Z').getTime()

  it('is open well before kickoff', () => {
    expect(isMatchLocked(makeMatch(), now)).toBe(false)
  })

  it('locks within one minute of kickoff', () => {
    const justBefore = new Date('2099-06-12T18:59:30Z').getTime()
    expect(isMatchLocked(makeMatch(), justBefore)).toBe(true)
  })

  it('locks once the match is no longer scheduled', () => {
    expect(isMatchLocked(makeMatch({ status: 'live' }), now)).toBe(true)
  })

  it('honours a server-side locked prediction flag', () => {
    const match = makeMatch({
      myPrediction: {
        id: 'p1',
        matchId: '1',
        predictedHomeScore: 1,
        predictedAwayScore: 0,
        predictedAdvancingTeamId: null,
        lockedAt: '2099-06-12T17:00:00Z',
        locked: true,
      },
    })
    expect(isMatchLocked(match, now)).toBe(true)
  })
})

describe('buildBracketRounds', () => {
  it('drops group-stage matches and orders rounds by progression', () => {
    const rounds = buildBracketRounds([
      makeMatch({ id: 'g', phase: 'group_stage' }),
      makeMatch({ id: 'f', phase: 'final' }),
      makeMatch({ id: 'r32', phase: 'round_of_32' }),
    ])
    expect(rounds.map((r) => r.phase)).toEqual(['round_of_32', 'final'])
  })

  it('sorts matches within a round by kickoff and drops empty rounds', () => {
    const rounds = buildBracketRounds([
      makeMatch({
        id: 'late',
        phase: 'round_of_32',
        kickoffAt: '2099-06-15T19:00:00Z',
      }),
      makeMatch({
        id: 'early',
        phase: 'round_of_32',
        kickoffAt: '2099-06-14T19:00:00Z',
      }),
    ])
    expect(rounds).toHaveLength(1)
    expect(rounds[0].matches.map((m) => m.id)).toEqual(['early', 'late'])
  })
})

describe('advancingPredictionOutcome', () => {
  const finished = {
    status: 'finished' as const,
    advancingTeamId: '1',
  }

  it('is null while unjudgeable', () => {
    expect(advancingPredictionOutcome(makeMatch())).toBeNull()
    expect(advancingPredictionOutcome(makeMatch(finished))).toBeNull()
  })

  it('marks a correct advancing-team prediction', () => {
    const match = makeMatch({
      ...finished,
      myPrediction: {
        id: 'p',
        matchId: '1',
        predictedHomeScore: 1,
        predictedAwayScore: 0,
        predictedAdvancingTeamId: '1',
        lockedAt: null,
        locked: true,
      },
    })
    expect(advancingPredictionOutcome(match)).toBe('correct')
  })

  it('marks an incorrect advancing-team prediction', () => {
    const match = makeMatch({
      ...finished,
      myPrediction: {
        id: 'p',
        matchId: '1',
        predictedHomeScore: 0,
        predictedAwayScore: 1,
        predictedAdvancingTeamId: '2',
        lockedAt: null,
        locked: true,
      },
    })
    expect(advancingPredictionOutcome(match)).toBe('incorrect')
  })
})
