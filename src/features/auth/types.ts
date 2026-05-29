/**
 * The authenticated user as the app consumes it: camelCase, derived from the
 * backend `UserBlueprint` (+ `needs_username` from `GET /auth/me`). Mapped from
 * the snake_case `AuthUserResponse` wire shape by the auth API client.
 */
export interface AuthUser {
  id: string
  email: string
  username: string | null
  isAdmin: boolean
  avatarUrl: string | null
  timezone: string | null
  /** ISO 8601 timestamp; null while the email is still unconfirmed. */
  confirmedAt: string | null
  /** True for OAuth users who haven't picked a username yet. */
  needsUsername: boolean
}

/**
 * Every `code` the auth/onboarding endpoints can return in the error envelope.
 * Auth screens switch on these to render the right copy. OAuth codes
 * (`use_password`, `oauth_failure`, `system_account`) arrive as a `?error=`
 * query param on the callback redirect rather than in a JSON body.
 */
export const AUTH_ERROR_CODES = [
  'invalid_credentials',
  'account_banned',
  'email_not_confirmed',
  'validation_error',
  'token_invalid',
  'token_expired',
  'use_password',
  'oauth_failure',
  'system_account',
  'username_already_set',
  'not_found',
  'service_error',
] as const

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number]
