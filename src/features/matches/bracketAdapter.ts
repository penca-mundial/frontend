import type {
  BracketMatch as SourceMatch,
  MatchPhase,
  MatchTeam,
} from '@/features/matches/types'
import {
  bracketAdvanceOutcome,
  buildBracketTree,
} from '@/features/matches/bracket'
import type {
  BracketMatch as BracketNode,
  BracketRound,
  BracketTeam,
} from '@/components/matches/KnockoutBracket'

/** Per-phase labels for the `KnockoutBracket` columns (long + mobile short). */
const PHASE_META: Partial<
  Record<MatchPhase, { key: string; label: string; short: string }>
> = {
  round_of_32: { key: 'r32', label: 'Dieciseisavos', short: '16avos' },
  round_of_16: { key: 'r16', label: 'Octavos', short: '8vos' },
  quarter_final: { key: 'qf', label: 'Cuartos', short: '4tos' },
  semi_final: { key: 'sf', label: 'Semis', short: 'Semis' },
  final: { key: 'final', label: 'Final', short: 'Final' },
}

export interface KnockoutBracketData {
  rounds: BracketRound[]
  thirdPlace: BracketNode | null
}

/** Rank a child by the slot it feeds (home top, away bottom) then position. */
function slotRank(match: SourceMatch): number {
  if (match.feedsIntoSlot === 'home') return 0
  if (match.feedsIntoSlot === 'away') return 1
  return 2
}

/**
 * Adapt our flat `BracketMatch[]` (from `GET /tournaments/:id/bracket`) to the
 * `KnockoutBracket` component's `rounds` + `thirdPlace` shape. Pure.
 *
 * - Groups by phase, ordered by `bracketPosition` (via `buildBracketTree`), each
 *   phase → a `BracketRound` with its label/short.
 * - Inverts the topology: our data has child→parent (`feedsIntoMatchId`); the
 *   component wants, per parent, its two feeders (`feeds: [childA, childB]`),
 *   ordered by slot (home, away). First round (no feeders) → `feeds: null`.
 * - Maps `homeTeam`/`awayTeam` → `{code3, name, flag}`, embedding the advance
 *   signal: the advancer in bold (`isAdvancing`) and the viewer's pick outcome
 *   (`pickOutcome` green/red) from `bracketAdvanceOutcome`. `third_place` is the
 *   loose `thirdPlace` card.
 */
export function toKnockoutBracket(matches: SourceMatch[]): KnockoutBracketData {
  const { columns, thirdPlace } = buildBracketTree(matches)

  // child → parent inverted into parent → [children], slot-ordered (home, away).
  const childrenByParent = new Map<string, SourceMatch[]>()
  for (const match of matches) {
    if (!match.feedsIntoMatchId) continue
    const children = childrenByParent.get(match.feedsIntoMatchId) ?? []
    children.push(match)
    childrenByParent.set(match.feedsIntoMatchId, children)
  }
  for (const children of childrenByParent.values()) {
    children.sort(
      (a, b) =>
        slotRank(a) - slotRank(b) ||
        (a.bracketPosition ?? 0) - (b.bracketPosition ?? 0),
    )
  }

  const toTeam = (
    team: MatchTeam | null,
    advancingTeamId: string | null,
    myPick: string | null,
    outcome: 'correct' | 'incorrect' | null,
  ): BracketTeam | null => {
    if (!team) return null
    return {
      code3: team.code3 ?? 'TBD',
      name: team.name,
      flag: team.flagUrl ?? '',
      isAdvancing: advancingTeamId !== null && team.id === advancingTeamId,
      pickOutcome: myPick !== null && team.id === myPick ? outcome : null,
    }
  }

  const toNode = (match: SourceMatch, isFirstRound: boolean): BracketNode => {
    const outcome = bracketAdvanceOutcome(match)
    const myPick = match.myPrediction?.predictedAdvancingTeamId ?? null
    const children = childrenByParent.get(match.id) ?? []
    const feeds: [string, string] | null =
      isFirstRound || children.length < 2
        ? null
        : [children[0].id, children[1].id]
    return {
      id: match.id,
      home: toTeam(match.homeTeam, match.advancingTeamId, myPick, outcome),
      away: toTeam(match.awayTeam, match.advancingTeamId, myPick, outcome),
      kickoff: match.kickoffAt,
      feeds,
    }
  }

  const rounds: BracketRound[] = columns.map((column, columnIndex) => {
    const meta = PHASE_META[column.phase] ?? {
      key: column.phase,
      label: column.phase,
      short: column.phase,
    }
    return {
      key: meta.key,
      label: meta.label,
      short: meta.short,
      matches: column.matches.map((match) => toNode(match, columnIndex === 0)),
    }
  })

  return {
    rounds,
    thirdPlace: thirdPlace ? toNode(thirdPlace, true) : null,
  }
}
