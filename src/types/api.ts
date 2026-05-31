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
  id: string
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

/** A standings row (`StandingBlueprint`). */
export interface StandingResponse {
  id: number
  group: string
  position: number
  played_games: number
  won: number
  draw: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
  form: string | null
  team: MatchTeamResponse | null
}

/** `GET /standings` envelope: rows grouped by group letter, ordered by position. */
export interface StandingsResponse {
  groups: Record<string, StandingResponse[]>
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
