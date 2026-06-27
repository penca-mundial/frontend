import type {
  BracketMatch as SourceMatch,
  Match,
  MatchPhase,
  MatchTeam,
  ProjectedBracketSlot,
} from '@/features/matches/types'
import {
  bracketAdvanceOutcome,
  buildBracketTree,
} from '@/features/matches/bracket'
import { isMatchLocked } from '@/features/matches/utils'
import type { Prediction } from '@/features/predictions/types'
import type {
  BracketMatch as BracketNode,
  BracketRound,
  BracketTeam,
} from '@/components/matches/KnockoutBracket'

/** The viewer's picks indexed by match id (from `/predictions/me`, ungated). */
export type PredictionsByMatch = ReadonlyMap<string, Prediction>

const EMPTY_PREDICTIONS: PredictionsByMatch = new Map()

/**
 * A bracket match as a plain `Match`, with the viewer's (ungated) pick attached.
 * Lets the rest of the app treat a bracket cross like any fixture — feeding the
 * shared `PredictionEditor` and `isMatchLocked` without bespoke bracket logic.
 */
export function bracketMatchToMatch(
  match: SourceMatch,
  prediction: Prediction | null,
): Match {
  return {
    id: match.id,
    externalId: null,
    // The bracket payload carries no tournament id per match; the editor and
    // lock logic don't use it (the upsert keys off match id).
    tournamentId: '',
    kickoffAt: match.kickoffAt,
    status: match.status,
    phase: match.phase,
    group: null,
    minute: match.minute,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    advancingTeamId: match.advancingTeamId,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    myPrediction: prediction,
  }
}

/**
 * Whether a bracket cross can be predicted from the cuadro. The gate (matches
 * the Calendar, server-authoritative via the 422 on save): a real, official
 * cross with both teams resolved, still `scheduled`, and not locked. Projected
 * slots never reach here. `now` is injectable for testing.
 */
export function isBracketNodePredictable(
  match: SourceMatch,
  prediction: Prediction | null,
  now: number = Date.now(),
): boolean {
  if (!match.homeTeam || !match.awayTeam) return false
  if (match.status !== 'scheduled') return false
  return !isMatchLocked(bracketMatchToMatch(match, prediction), now)
}

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
export function toKnockoutBracket(
  matches: SourceMatch[],
  predictionsByMatch: PredictionsByMatch = EMPTY_PREDICTIONS,
): KnockoutBracketData {
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
    score: number | null,
  ): BracketTeam | null => {
    if (!team) return null
    const isMyAdvancer = myPick !== null && team.id === myPick
    return {
      code3: team.code3 ?? 'TBD',
      name: team.name,
      flag: team.flagUrl ?? '',
      isAdvancing: advancingTeamId !== null && team.id === advancingTeamId,
      // The team I picked to advance: amber row until the match is played, then
      // green/red once `pickOutcome` can be judged.
      isMyAdvancer,
      pickOutcome: isMyAdvancer ? outcome : null,
      score,
    }
  }

  const toNode = (match: SourceMatch, isFirstRound: boolean): BracketNode => {
    const outcome = bracketAdvanceOutcome(match)
    const prediction = predictionsByMatch.get(match.id) ?? null
    // My advancing pick: from the ungated /predictions merge (covers OPEN
    // crosses, where /bracket withholds it) or the gated bracket pick.
    const myPick =
      prediction?.predictedAdvancingTeamId ??
      match.myPrediction?.predictedAdvancingTeamId ??
      null

    // The score shown on each team's row: the REAL result once the match is
    // played (live/finished), else the viewer's PREDICTED score on an open
    // cross. They must never be confused — `scoreKind` drives the tint + tag.
    const played =
      (match.status === 'live' || match.status === 'finished') &&
      match.homeScore !== null &&
      match.awayScore !== null
    let homeScore: number | null = null
    let awayScore: number | null = null
    let scoreKind: 'real' | 'predicted' | null = null
    if (played) {
      homeScore = match.homeScore
      awayScore = match.awayScore
      scoreKind = 'real'
    } else if (prediction) {
      homeScore = prediction.predictedHomeScore
      awayScore = prediction.predictedAwayScore
      scoreKind = 'predicted'
    }

    const children = childrenByParent.get(match.id) ?? []
    const feeds: [string, string] | null =
      isFirstRound || children.length < 2
        ? null
        : [children[0].id, children[1].id]
    return {
      id: match.id,
      home: toTeam(match.homeTeam, match.advancingTeamId, myPick, outcome, homeScore),
      away: toTeam(match.awayTeam, match.advancingTeamId, myPick, outcome, awayScore),
      kickoff: match.kickoffAt,
      feeds,
      scoreKind,
      predictable: isBracketNodePredictable(match, prediction),
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

/** A projected slot's team → the component's compact team (no advance signal). */
function projectedTeam(team: MatchTeam): BracketTeam {
  return { code3: team.code3 ?? 'TBD', name: team.name, flag: team.flagUrl ?? '' }
}

/**
 * Adapt the PROJECTED Round-of-32 (`GET .../bracket/projected`) to the
 * `KnockoutBracket` shape: a single "Dieciseisavos" column, ordered by
 * `bracketPosition`, with no feeders (`feeds: null`) and no later rounds. A null
 * side renders the "A definir" label; projected slots carry no kickoff
 * (`kickoff: ''`) and no advance signal. Pure.
 */
export function projectedToKnockoutBracket(
  slots: ProjectedBracketSlot[],
): KnockoutBracketData {
  const matches: BracketNode[] = [...slots]
    .sort((a, b) => a.bracketPosition - b.bracketPosition)
    .map((slot) => ({
      id: `r32-${slot.bracketPosition}`,
      home: slot.home ? projectedTeam(slot.home) : null,
      away: slot.away ? projectedTeam(slot.away) : null,
      homeLabel: slot.home ? undefined : 'A definir',
      awayLabel: slot.away ? undefined : 'A definir',
      kickoff: '',
      feeds: null,
    }))

  return {
    rounds: [
      { key: 'r32', label: 'Dieciseisavos', short: '16avos', matches },
    ],
    thirdPlace: null,
  }
}
