/** Inner error object of the backend's standard envelope. */
export interface ApiError {
  code: string
  message: string
  details?: ApiErrorDetails
}

/**
 * Extra error context. Validation failures arrive as `errors` (an array of
 * human-readable, already-translated messages); other endpoints may attach
 * arbitrary keys.
 */
export interface ApiErrorDetails {
  errors?: string[]
  [key: string]: unknown
}

/** Standard error envelope returned by the backend: `{ error: { ... } }`. */
export interface ApiErrorResponse {
  error: ApiError
}

/** Generic paginated list response. */
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    perPage: number
    totalPages: number
    totalCount: number
  }
}

// ─── Auth ───────────────────────────────────────────────────────────────────

/** Body for `POST /auth/login`. */
export interface LoginPayload {
  email: string
  password: string
}

/** Body for `POST /auth/signup`. */
export interface SignupPayload {
  email: string
  password: string
  username: string
}

/** Body for `POST /auth/password` (request a reset email). */
export interface RequestPasswordResetPayload {
  email: string
}

/**
 * Body for `PUT /auth/password` (set a new password). Field names match the
 * backend / Devise contract verbatim, hence the snake_case token key.
 */
export interface ResetPasswordPayload {
  reset_password_token: string
  password: string
}

/** Body for `POST /auth/confirmation` (resend the confirmation email). */
export interface ResendConfirmationPayload {
  email: string
}

/**
 * Wire shape of the user object serialized by the backend `UserBlueprint`.
 * snake_case as received over the network — the auth API maps it to the
 * camelCase `AuthUser` domain type before handing it to the app.
 */
export interface AuthUserResponse {
  // The backend serialises the user id as a number (integer PK); `mapUser`
  // normalises it to a string for the domain `AuthUser`.
  id: number
  email: string
  username: string | null
  admin: boolean
  avatar_url: string | null
  timezone: string | null
  confirmed_at: string | null
}

/** Envelope returned by login / signup / reset-password. */
export interface AuthUserResponseEnvelope {
  user: AuthUserResponse
}

/** Response of `GET /auth/me` — adds `needs_username` to the user object. */
export interface AuthMeResponse {
  user: AuthUserResponse & { needs_username: boolean }
}

// ─── Matches ──────────────────────────────────────────────────────────────

/** Compact team object embedded in a match, as serialized by `MatchBlueprint`. */
export interface MatchTeamResponse {
  id: number
  name: string
  code3: string | null
  flag_url: string | null
}

/**
 * A computed standings row (`GET /tournaments/:id/standings`, SCRUM-244). The
 * tables are derived from the matches: pre-tournament every team sits at 0,
 * stats update live during. Rows arrive already ordered within their group
 * (points → goal difference → goals for).
 */
export interface ComputedStandingRow {
  team: MatchTeamResponse | null
  position: number
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
}

/** A computed group's table (`GET /tournaments/:id/standings`). */
export interface ComputedGroupStandings {
  name: string
  standings: ComputedStandingRow[]
}

/** One leaderboard row (`RankingEntryBlueprint`, SCRUM-276). */
export interface RankingEntryResponse {
  user_id: number
  username: string | null
  avatar_url: string | null
  points: number
  exact_count: number
  rank_position: number
}

/**
 * A group's leaderboard slice (`GET /rankings/groups/:id`). With
 * `include_me=true`, `me` is a small window of rows around the current user
 * (their row + neighbours), so the caller must pick the row whose `user_id`
 * matches the current user — it is NOT `me[0]`. Null when there is no row yet.
 */
export interface GroupRankingResponse {
  entries: RankingEntryResponse[]
  me: RankingEntryResponse[] | null
}

/** A penca/group membership (`GET /groups/me` and `/groups/:id`, `GroupBlueprint`). */
export interface GroupResponse {
  id: number
  name: string
  description: string | null
  is_general_pool: boolean
  code: string
  member_count: number
  is_owner: boolean
  created_at: string
  /** Creator's username (SCRUM-281); null only if the creator has none. */
  owner_username: string | null
}

/** `GET /tournaments/current` (`TournamentBlueprint`). */
export interface TournamentResponse {
  id: number
  name: string
  starts_at: string
  ends_at: string | null
  external_code: string | null
  champion_id: number | null
  runner_up_id: number | null
  third_place_id: number | null
  fourth_place_id: number | null
  top_scorer_id: number | null
  is_locked: boolean
  seconds_until_kickoff: number
}

/** A player row (`PlayerBlueprint`) with its embedded compact team. */
export interface PlayerResponse {
  id: number
  name: string
  external_id: string | null
  team_id: number
  team: MatchTeamResponse | null
}

/** A user's tournament-wide prediction (`TournamentPredictionBlueprint`). */
export interface TournamentPredictionResponse {
  id: number
  tournament_id: number
  champion_id: number | null
  runner_up_id: number | null
  third_place_id: number | null
  fourth_place_id: number | null
  top_scorer_id: number | null
  locked_at: string | null
  locked: boolean
}

/** Flat upsert body for `PUT /tournament_predictions` (all picks optional). */
export interface UpsertTournamentPredictionPayload {
  champion_id?: string | null
  runner_up_id?: string | null
  third_place_id?: string | null
  fourth_place_id?: string | null
  top_scorer_id?: string | null
}

/**
 * Wire shape of a match from `MatchBlueprint`. `my_prediction` is only present
 * on `GET /matches/:id` when a user is signed in (null when they have none).
 */
export interface MatchResponse {
  id: number
  external_id: string | null
  tournament_id: number
  kickoff_at: string
  status: string
  phase: string
  group?: string | null
  minute?: number | null
  home_score: number | null
  away_score: number | null
  advancing_team_id: number | null
  home_team: MatchTeamResponse | null
  away_team: MatchTeamResponse | null
  my_prediction?: PredictionResponse | null
}

// ─── Predictions ────────────────────────────────────────────────────────────

/** Wire shape of a prediction from `PredictionBlueprint`. */
export interface PredictionResponse {
  id: number
  match_id: number
  predicted_home_score: number
  predicted_away_score: number
  predicted_advancing_team_id: number | null
  locked_at: string | null
  locked: boolean
}

/**
 * Body for `PUT /predictions` (upsert). Field names match the backend's
 * permitted params verbatim. Scores are 0–20; the advancing team is required
 * for knockout matches and omitted for the group stage.
 */
export interface UpsertPredictionPayload {
  match_id: string | number
  predicted_home_score: number
  predicted_away_score: number
  predicted_advancing_team_id?: string | number | null
}
