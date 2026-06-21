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
  /**
   * OAuth provider (`google_oauth2`) or null for password accounts. Optional:
   * shipping in parallel on the backend (SCRUM-199) — absent until deployed.
   */
  provider?: string | null
  /** Account creation timestamp (ISO 8601). Optional — see `provider`. */
  created_at?: string
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

/**
 * One scoring rule (`GET /scoring_rules`, SCRUM-296). `rule_type` is the
 * machine key (`exact_score`, `champion_correct`, …); `label` is already
 * localized (es) by the backend, so the SPA renders it verbatim.
 */
export interface ScoringRuleResponse {
  rule_type: string
  points: number
  label: string
}

/** One per-phase multiplier (`GET /scoring_rules`). `multiplier` is a number. */
export interface PhaseMultiplierResponse {
  phase: string
  multiplier: number
  label: string
}

/** The full scoring configuration (`GET /scoring_rules`, public). */
export interface ScoringConfigResponse {
  scoring_rules: ScoringRuleResponse[]
  phase_multipliers: PhaseMultiplierResponse[]
}

/**
 * One point of a penca evolution line (`GET /rankings/groups/:id/evolution`,
 * SCRUM-286/302). `date` is an ISO date (UTC snapshot day); `rank` is the
 * user's position among the group's members on that day (ties share a rank).
 */
export interface EvolutionPointResponse {
  date: string
  points: number
  rank: number
}

/** One chart line: the user identity plus their dated series. */
export interface EvolutionLineResponse {
  user: { id: number; username: string | null; avatar_url: string | null }
  series: EvolutionPointResponse[]
}

/**
 * Per-penca points/rank evolution (`GET /rankings/groups/:id/evolution`). Up to
 * 5 lines (group top 4 + the current user). `available` is false — with no
 * lines — until the tournament has ≥5 finished matches.
 */
export interface GroupEvolutionResponse {
  available: boolean
  lines: EvolutionLineResponse[]
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
 * A leaderboard slice (`GET /rankings/global` and `/rankings/groups/:id`,
 * same shape — SCRUM-155). With `include_me=true`, `me` is a small window of
 * rows around the current user (their row + neighbours), so the caller must
 * pick the row whose `user_id` matches the current user — it is NOT `me[0]`.
 * Null when there is no row yet.
 */
export interface LeaderboardResponse {
  entries: RankingEntryResponse[]
  me: RankingEntryResponse[] | null
  /** 1-based page echo (SCRUM-280). */
  page: number
  /** True while more ranked pages exist past this one. */
  has_more: boolean
  /**
   * Total ranked participants (for "Posición N de TOTAL"). Optional: shipping
   * in parallel on the backend (SCRUM-199) — absent until deployed.
   */
  total?: number
}

/** One member row (`GET /groups/:id/members`, `GroupMemberBlueprint`). */
export interface GroupMemberResponse {
  joined_at: string
  is_owner: boolean
  user: {
    id: number
    username: string | null
    avatar_url: string | null
  }
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
  /**
   * Points this prediction earned for its match, once scored. Present on
   * finished-match payloads (e.g. `GET /matches/recent_finished`); absent/null
   * until the backend computes it.
   */
  points?: number | null
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

// ─── Knockout bracket (SCRUM-317) ───────────────────────────────────────────

/**
 * The viewer's locked pick embedded per bracket match (`PredictionBlueprint`).
 * HARD-GATED server-side to locked picks: an open future knockout match never
 * leaks the pick (then `my_prediction` is null). Carries `points_earned` (not
 * `points`) and the advancing-team pick that drives the green/red signal.
 */
export interface BracketPredictionResponse {
  id: number
  match_id: number
  predicted_home_score: number
  predicted_away_score: number
  predicted_advancing_team_id: number | null
  locked_at: string | null
  locked: boolean
  points_earned: number
}

/**
 * One knockout match in the bracket (`MatchBlueprint` `:bracket` view + the
 * gated `my_prediction`). Only EXISTING knockout matches come (create-on-resolve,
 * ADR-0001) — both teams are always resolved; unresolved rounds are absent.
 * `feeds_into_slot` is the enum key ("home"/"away") or null for the sinks
 * (final, third_place).
 */
export interface BracketMatchResponse {
  id: number
  external_id: string | null
  tournament_id: number
  kickoff_at: string
  status: string
  phase: string
  group: string | null
  minute: number | null
  home_score: number | null
  away_score: number | null
  advancing_team_id: number | null
  home_team: MatchTeamResponse | null
  away_team: MatchTeamResponse | null
  feeds_into_match_id: number | null
  feeds_into_slot: 'home' | 'away' | null
  bracket_position: number | null
  my_prediction: BracketPredictionResponse | null
}

/** `GET /api/v1/tournaments/:id/bracket`. */
export interface BracketResponse {
  matches: BracketMatchResponse[]
}

// ─── Public user profile (SCRUM-305) ─────────────────────────────────────────

/** The viewed user's identity (`GET /users/:id/profile`). */
export interface ProfileUserResponse {
  id: number
  username: string | null
  avatar_url: string | null
}

/** The viewed user's row in the global leaderboard + the universe size. */
export interface ProfileGlobalRankingResponse {
  /** 1-based rank; null when the user has no scored predictions yet. */
  rank_position: number | null
  points: number
  exact_count: number
  total: number
}

/** The viewed user's standing inside a penca both viewer and target share. */
export interface ProfileSharedGroupResponse {
  group: { id: number; name: string; is_general_pool: boolean }
  rank_position: number | null
  points: number
  total: number
}

/**
 * The viewed user's tournament prediction with the podium teams and the top
 * scorer embedded (`TournamentPredictionBlueprint` with associations), so the
 * profile renders the picks without extra `/teams` or `/players` requests.
 */
export interface EmbeddedTournamentPredictionResponse
  extends TournamentPredictionResponse {
  champion: MatchTeamResponse | null
  runner_up: MatchTeamResponse | null
  third_place: MatchTeamResponse | null
  fourth_place: MatchTeamResponse | null
  top_scorer: PlayerResponse | null
}

/**
 * The gated tournament-prediction block: hidden until the first kickoff
 * (`available:false` + a `reason`), then the pick (or null if they made none).
 */
export type ProfileTournamentPredictionResponse =
  | { available: false; reason: string }
  | { available: true; prediction: EmbeddedTournamentPredictionResponse | null }

/** Accuracy buckets over the viewed user's scored predictions. */
export interface ProfileStatsResponse {
  exact: number
  correct_winner: number
  goal_difference: number
  missed: number
  total: number
}

/** `GET /users/:id/profile`. */
export interface UserProfileResponse {
  user: ProfileUserResponse
  global_ranking: ProfileGlobalRankingResponse
  shared_groups: ProfileSharedGroupResponse[]
  tournament_prediction: ProfileTournamentPredictionResponse
  stats: ProfileStatsResponse
}

/**
 * The compact pick projection on a profile predictions entry (`UserScoreboard`
 * relabels its `my_prediction` to `prediction`): only the picked score and the
 * points it earns at the match's current score — no id/lock fields.
 */
export interface ProfilePredictionPickResponse {
  predicted_home_score: number
  predicted_away_score: number
  points: number
}

/** One entry of `GET /users/:id/predictions`: a match (MatchBlueprint) + the pick. */
export interface UserPredictionEntryResponse
  extends Omit<MatchResponse, 'my_prediction'> {
  prediction: ProfilePredictionPickResponse
}

/** `GET /users/:id/predictions` (paginated, live match first then finished). */
export interface UserPredictionsResponse {
  entries: UserPredictionEntryResponse[]
  page: number
  has_more: boolean
}
