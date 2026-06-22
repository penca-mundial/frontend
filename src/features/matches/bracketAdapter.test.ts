import { describe, expect, it } from 'vitest'
import { toKnockoutBracket } from '@/features/matches/bracketAdapter'
import type {
  BracketMatch,
  BracketPrediction,
  MatchPhase,
} from '@/features/matches/types'

const URU = {
  id: '1',
  name: 'Uruguay',
  code3: 'URU',
  flagUrl: 'http://x/uru.png',
}
const ARG = { id: '2', name: 'Argentina', code3: 'ARG', flagUrl: null }
const BRA = { id: '3', name: 'Brasil', code3: 'BRA', flagUrl: null }
const FRA = { id: '4', name: 'Francia', code3: 'FRA', flagUrl: null }

function pick(advancing: string): BracketPrediction {
  return {
    id: 'p',
    matchId: 'm',
    predictedHomeScore: 1,
    predictedAwayScore: 0,
    predictedAdvancingTeamId: advancing,
    locked: true,
    pointsEarned: 0,
  }
}

function bm(
  overrides: Partial<BracketMatch> & { id: string; phase: MatchPhase },
): BracketMatch {
  return {
    status: 'finished',
    kickoffAt: '2026-07-12T18:00:00Z',
    minute: null,
    homeScore: 1,
    awayScore: 0,
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

// Two QF feeding one SF, plus a third-place match.
function sampleBracket(): BracketMatch[] {
  return [
    bm({
      id: 'qfA',
      phase: 'quarter_final',
      bracketPosition: 0,
      feedsIntoMatchId: 'sf',
      feedsIntoSlot: 'home',
      advancingTeamId: '1',
      homeTeam: URU,
      awayTeam: ARG,
      myPrediction: pick('1'), // picked URU, URU advanced → correct
    }),
    bm({
      id: 'qfB',
      phase: 'quarter_final',
      bracketPosition: 1,
      feedsIntoMatchId: 'sf',
      feedsIntoSlot: 'away',
      advancingTeamId: '3',
      homeTeam: BRA,
      awayTeam: FRA,
      myPrediction: pick('4'), // picked FRA, BRA advanced → incorrect
    }),
    bm({
      id: 'sf',
      phase: 'semi_final',
      bracketPosition: 0,
      homeTeam: URU,
      awayTeam: BRA,
      advancingTeamId: null,
      status: 'scheduled',
    }),
    bm({
      id: 'tp',
      phase: 'third_place',
      bracketPosition: null,
      homeTeam: ARG,
      awayTeam: FRA,
    }),
  ]
}

describe('toKnockoutBracket', () => {
  it('groups by phase into ordered rounds with labels, third place apart', () => {
    const { rounds, thirdPlace } = toKnockoutBracket(sampleBracket())

    expect(rounds.map((r) => r.key)).toEqual(['qf', 'sf'])
    expect(rounds.map((r) => r.label)).toEqual(['Cuartos', 'Semis'])
    expect(thirdPlace?.id).toBe('tp')
    // third place is NOT a tree round
    expect(rounds.some((r) => r.matches.some((m) => m.id === 'tp'))).toBe(false)
  })

  it('inverts the topology: parent feeds = [home-slot child, away-slot child]', () => {
    const { rounds } = toKnockoutBracket(sampleBracket())
    const sf = rounds[1].matches[0]
    expect(sf.feeds).toEqual(['qfA', 'qfB']) // qfA is the "home" feeder, qfB the "away"
    // first round has no feeders
    expect(rounds[0].matches[0].feeds).toBeNull()
  })

  it('maps teams (flag fallback) and embeds the advance signal', () => {
    const { rounds } = toKnockoutBracket(sampleBracket())
    const [qfA, qfB] = rounds[0].matches

    // qfA: URU advanced and I picked URU → home is advancing + correct.
    expect(qfA.home).toMatchObject({
      code3: 'URU',
      name: 'Uruguay',
      flag: 'http://x/uru.png',
      isAdvancing: true,
      pickOutcome: 'correct',
    })
    expect(qfA.away?.isAdvancing).toBe(false)
    expect(qfA.away?.pickOutcome).toBeNull()

    // qfB: BRA advanced, I picked FRA → FRA (away) carries the incorrect signal.
    expect(qfB.home).toMatchObject({ name: 'Brasil', isAdvancing: true })
    expect(qfB.away).toMatchObject({
      name: 'Francia',
      pickOutcome: 'incorrect',
      flag: '',
    })
  })

  it('returns empty rounds when there are no knockout matches', () => {
    expect(toKnockoutBracket([]).rounds).toEqual([])
    expect(toKnockoutBracket([]).thirdPlace).toBeNull()
  })
})
