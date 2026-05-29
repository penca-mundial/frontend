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
