import type { Match, MatchPhase } from '@/features/matches/types'

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
