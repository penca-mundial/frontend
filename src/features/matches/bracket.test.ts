import { describe, expect, it } from 'vitest'
import {
  bracketAdvanceOutcome,
  buildBracketTree,
} from '@/features/matches/bracket'
import type { BracketMatch, MatchPhase } from '@/features/matches/types'

const URU = { id: '1', name: 'Uruguay', code3: 'URU', flagUrl: null }
const ARG = { id: '2', name: 'Argentina', code3: 'ARG', flagUrl: null }

function bm(
  overrides: Partial<BracketMatch> & { id: string; phase: MatchPhase },
): BracketMatch {
  return {
    status: 'finished',
    kickoffAt: '2026-07-12T18:00:00Z',
    minute: null,
    homeScore: 1,
    awayScore: 0,
    advancingTeamId: '1',
    homeTeam: URU,
    awayTeam: ARG,
    feedsIntoMatchId: null,
    feedsIntoSlot: null,
    bracketPosition: 0,
    myPrediction: null,
    ...overrides,
  }
}

describe('buildBracketTree', () => {
  it('orders columns by progression and splits third place out of the tree', () => {
    const { columns, thirdPlace } = buildBracketTree([
      bm({ id: 'final', phase: 'final' }),
      bm({ id: 'tp', phase: 'third_place', bracketPosition: null }),
      bm({ id: 'sf', phase: 'semi_final' }),
    ])

    expect(columns.map((c) => c.phase)).toEqual(['semi_final', 'final'])
    expect(thirdPlace?.id).toBe('tp')
  })

  it('sorts matches within a round by bracket_position (feeders adjacent)', () => {
    const { columns } = buildBracketTree([
      bm({ id: 'qf2', phase: 'quarter_final', bracketPosition: 2 }),
      bm({ id: 'qf0', phase: 'quarter_final', bracketPosition: 0 }),
      bm({ id: 'qf1', phase: 'quarter_final', bracketPosition: 1 }),
    ])
    expect(columns[0].matches.map((m) => m.id)).toEqual(['qf0', 'qf1', 'qf2'])
  })

  it('drops rounds with no matches', () => {
    const { columns } = buildBracketTree([bm({ id: 'f', phase: 'final' })])
    expect(columns).toHaveLength(1)
    expect(columns[0].phase).toBe('final')
  })
})

describe('bracketAdvanceOutcome', () => {
  const pick = (advancing: string) => ({
    id: 'p',
    matchId: 'm',
    predictedHomeScore: 1,
    predictedAwayScore: 0,
    predictedAdvancingTeamId: advancing,
    locked: true,
    pointsEarned: 0,
  })

  it('is correct when my advance pick matches the actual advancer', () => {
    expect(
      bracketAdvanceOutcome(
        bm({ id: 'm', phase: 'final', advancingTeamId: '1', myPrediction: pick('1') }),
      ),
    ).toBe('correct')
  })

  it('is incorrect when my advance pick differs from the advancer', () => {
    expect(
      bracketAdvanceOutcome(
        bm({ id: 'm', phase: 'final', advancingTeamId: '2', myPrediction: pick('1') }),
      ),
    ).toBe('incorrect')
  })

  it('is null when unfinished, no pick, or no winner yet', () => {
    expect(
      bracketAdvanceOutcome(
        bm({ id: 'm', phase: 'final', status: 'scheduled', myPrediction: pick('1') }),
      ),
    ).toBeNull()
    expect(
      bracketAdvanceOutcome(bm({ id: 'm', phase: 'final', myPrediction: null })),
    ).toBeNull()
    expect(
      bracketAdvanceOutcome(
        bm({ id: 'm', phase: 'final', advancingTeamId: null, myPrediction: pick('1') }),
      ),
    ).toBeNull()
  })
})
