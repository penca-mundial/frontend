import type { BracketMatch, MatchPhase } from '@/features/matches/types'

/**
 * The bracket tree columns in progression order. `third_place` is NOT a tree
 * node (it's a consolation match) — it is split out and shown on its own.
 */
const BRACKET_TREE_ORDER: MatchPhase[] = [
  'round_of_32',
  'round_of_16',
  'quarter_final',
  'semi_final',
  'final',
]

export interface BracketColumn {
  phase: MatchPhase
  matches: BracketMatch[]
}

export interface BracketTree {
  columns: BracketColumn[]
  thirdPlace: BracketMatch | null
}

/**
 * Group bracket matches into ordered tree columns — only the rounds that exist
 * (create-on-resolve: unresolved rounds simply aren't here) — each sorted by
 * `bracketPosition` so the two feeders of a cruce stay adjacent (2k / 2k+1).
 * Third place is pulled out of the tree.
 */
export function buildBracketTree(matches: BracketMatch[]): BracketTree {
  const thirdPlace = matches.find((match) => match.phase === 'third_place') ?? null

  const byPosition = (a: BracketMatch, b: BracketMatch): number =>
    (a.bracketPosition ?? Number.POSITIVE_INFINITY) -
    (b.bracketPosition ?? Number.POSITIVE_INFINITY)

  const columns = BRACKET_TREE_ORDER.map((phase) => ({
    phase,
    matches: matches.filter((match) => match.phase === phase).sort(byPosition),
  })).filter((column) => column.matches.length > 0)

  return { columns, thirdPlace }
}

export type AdvanceOutcome = 'correct' | 'incorrect' | null

/**
 * Whether the viewer correctly predicted who advances from a knockout match,
 * comparing their `predictedAdvancingTeamId` against the real `advancingTeamId`.
 * null when it can't be judged yet (unfinished, no pick, or no winner recorded)
 * — i.e. no green/red signal.
 */
export function bracketAdvanceOutcome(match: BracketMatch): AdvanceOutcome {
  const pick = match.myPrediction?.predictedAdvancingTeamId
  if (match.status !== 'finished' || !pick || match.advancingTeamId === null) {
    return null
  }
  return pick === match.advancingTeamId ? 'correct' : 'incorrect'
}
