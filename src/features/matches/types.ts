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
  /** Group letter (e.g. "A"); null/absent for knockout matches. From SCRUM-257. */
  group?: string | null
  /** Live elapsed minute while `status === 'live'`; null otherwise. From SCRUM-259. */
  minute?: number | null
  homeScore: number | null
  awayScore: number | null
  advancingTeamId: string | null
  homeTeam: MatchTeam | null
  awayTeam: MatchTeam | null
  myPrediction?: Prediction | null
}

/** One column of the knockout bracket: a phase and its matches, in order. */
export interface BracketRound {
  phase: MatchPhase
  matches: Match[]
}

/**
 * A team's standing row within a group, as the app consumes it (camelCase,
 * from `GET /standings`). Already ordered by `position` by the backend.
 */
export interface Standing {
  id: string
  group: string
  position: number
  playedGames: number
  won: number
  draw: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  /** Recent form string (e.g. "WWLD"), or null when not computed. */
  form: string | null
  team: MatchTeam | null
}

/** A single group's standings rows (ordered by position). */
export interface GroupStandings {
  group: string
  rows: Standing[]
}
