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

/** Which slot of the next-round match a winner feeds into. */
export type BracketSlot = 'home' | 'away'

/**
 * The viewer's locked pick on a bracket match (camelCase of
 * `BracketPredictionResponse`). `pointsEarned` and `predictedAdvancingTeamId`
 * (the team the viewer said would advance) drive the green/red advance signal.
 */
export interface BracketPrediction {
  id: string
  matchId: string
  predictedHomeScore: number
  predictedAwayScore: number
  predictedAdvancingTeamId: string | null
  locked: boolean
  pointsEarned: number
}

/**
 * A knockout match as the bracket consumes it (`GET /tournaments/:id/bracket`):
 * the fixture plus its topology (`feedsIntoMatchId` / `feedsIntoSlot` /
 * `bracketPosition`) so the SPA can draw the tree, and the gated `myPrediction`.
 * Both teams are always resolved (create-on-resolve). Distinct from `Match`
 * because the prediction shape differs (advance pick + points earned).
 */
export interface BracketMatch {
  id: string
  phase: MatchPhase
  status: MatchStatus
  kickoffAt: string
  minute: number | null
  homeScore: number | null
  awayScore: number | null
  advancingTeamId: string | null
  homeTeam: MatchTeam | null
  awayTeam: MatchTeam | null
  feedsIntoMatchId: string | null
  feedsIntoSlot: BracketSlot | null
  bracketPosition: number | null
  myPrediction: BracketPrediction | null
}

/**
 * One Round-of-32 slot of the PROJECTED bracket (`GET .../bracket/projected`):
 * the cross resolved from the viewer's projected group positions blended with
 * real results. A team is null ("A definir") when its rank is ambiguous/unknown.
 */
export interface ProjectedBracketSlot {
  bracketPosition: number
  home: MatchTeam | null
  away: MatchTeam | null
  source: 'real' | 'projected'
}

/**
 * The projected bracket payload. `projected` is true while any slot is still
 * projected; once false (the 16 crosses are confirmed) the SPA switches to the
 * official `BracketMatch[]` tree.
 */
export interface ProjectedBracket {
  projected: boolean
  roundOf32: ProjectedBracketSlot[]
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
