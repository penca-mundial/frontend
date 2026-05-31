import type { Prediction } from '@/features/predictions/types'

/** Match lifecycle states (backend `Match::STATUSES`). */
export type MatchStatus =
  | 'scheduled'
  | 'live'
  | 'finished'
  | 'postponed'
  | 'cancelled'

/** Tournament phases (backend `Match::PHASES`). */
export type MatchPhase =
  | 'group_stage'
  | 'round_of_32'
  | 'round_of_16'
  | 'quarter_final'
  | 'semi_final'
  | 'third_place'
  | 'final'

/** Compact team projection embedded in a match. */
export interface MatchTeam {
  id: string
  name: string
  /** FIFA 3-letter code (e.g. "URU"); null until teams are finalised. */
  code3: string | null
  flagUrl: string | null
}

/**
 * A fixture as the app consumes it: camelCase, derived from the backend
 * `MatchBlueprint`. `myPrediction` is only populated by `GET /matches/:id`
 * for a signed-in user (null when they have none, undefined when not fetched).
 */
export interface Match {
  id: string
  externalId: string | null
  tournamentId: string
  kickoffAt: string
  status: MatchStatus
  phase: MatchPhase
  homeScore: number | null
  awayScore: number | null
  advancingTeamId: string | null
  homeTeam: MatchTeam | null
  awayTeam: MatchTeam | null
  myPrediction?: Prediction | null
}
