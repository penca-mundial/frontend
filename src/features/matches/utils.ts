import type { BracketRound, Match, MatchPhase } from '@/features/matches/types'

/**
 * The live-match card treatment: a red border + soft red glow. Single source
 * shared by the Fixture's `MatchCardExpandable` and the dashboard's
 * `LiveMatchCard` so the "in play" look never drifts between them.
 */
export const LIVE_MATCH_CARD_BORDER =
  'border-live/45 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]'

/**
 * Spanish (rioplatense) labels for each tournament phase. Note the 48-team
 * 2026 bracket: the first knockout round is "Dieciseisavos" (round_of_32),
 * NOT "Octavos" — see CLAUDE.md.
 */
export const PHASE_LABELS: Record<MatchPhase, string> = {
  group_stage: 'Fase de grupos',
  round_of_32: 'Dieciseisavos',
  round_of_16: 'Octavos',
  quarter_final: 'Cuartos',
  semi_final: 'Semifinal',
  third_place: 'Tercer puesto',
  final: 'Final',
}

/** Phases played as single-elimination knockouts (everything but the groups). */
const KNOCKOUT_PHASES: ReadonlySet<MatchPhase> = new Set<MatchPhase>([
  'round_of_32',
  'round_of_16',
  'quarter_final',
  'semi_final',
  'third_place',
  'final',
])

/** Human label for a phase, defensive against unknown backend values. */
export function getPhaseLabel(phase: string): string {
  return PHASE_LABELS[phase as MatchPhase] ?? phase
}

/** Whether the phase is a knockout (and thus needs an advancing-team pick). */
export function isKnockoutPhase(phase: string): boolean {
  return KNOCKOUT_PHASES.has(phase as MatchPhase)
}

/**
 * Knockout rounds in bracket progression order. `third_place` is rendered
 * alongside the final, so it is ordered just before it.
 */
export const KNOCKOUT_ROUND_ORDER: readonly MatchPhase[] = [
  'round_of_32',
  'round_of_16',
  'quarter_final',
  'semi_final',
  'third_place',
  'final',
]

/**
 * Group knockout matches into ordered bracket rounds, dropping group-stage
 * matches and rounds with no matches. Within a round, matches keep chronological
 * order (kickoff ascending) so the bracket reads top-to-bottom consistently.
 */
export function buildBracketRounds(matches: Match[]): BracketRound[] {
  return KNOCKOUT_ROUND_ORDER.map((phase) => ({
    phase,
    matches: matches
      .filter((match) => match.phase === phase)
      .sort(
        (a, b) =>
          new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime(),
      ),
  })).filter((round) => round.matches.length > 0)
}

/**
 * Whether the user correctly predicted who advances from a knockout match.
 * Returns null when it can't be judged yet (match unfinished, no prediction, or
 * no actual winner recorded).
 */
export function advancingPredictionOutcome(
  match: Match,
): 'correct' | 'incorrect' | null {
  if (
    match.status !== 'finished' ||
    !match.myPrediction ||
    match.advancingTeamId === null ||
    match.myPrediction.predictedAdvancingTeamId === null
  ) {
    return null
  }
  return match.myPrediction.predictedAdvancingTeamId === match.advancingTeamId
    ? 'correct'
    : 'incorrect'
}

/** Predictions lock from one minute before kickoff (mirrors the backend). */
export const PREDICTION_LOCK_THRESHOLD_MS = 60_000

/**
 * Whether predictions for a match are locked. Mirrors the backend
 * `Prediction#locked?`: locked once the match leaves the `scheduled` state, or
 * once kickoff is within one minute. Uses an existing prediction's server-side
 * `locked` flag when available (authoritative), otherwise derives from the
 * match. `now` is injectable for testing.
 */
export function isMatchLocked(match: Match, now: number = Date.now()): boolean {
  if (match.myPrediction?.locked) {
    return true
  }
  if (match.status !== 'scheduled') {
    return true
  }
  return new Date(match.kickoffAt).getTime() - now <= PREDICTION_LOCK_THRESHOLD_MS
}
