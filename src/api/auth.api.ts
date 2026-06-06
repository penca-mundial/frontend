import { isAxiosError } from 'axios'
import { del, get, post, put } from '@/api/client'
import type {
  ApiError,
  ApiErrorResponse,
  AuthMeResponse,
  AuthUserResponse,
  AuthUserResponseEnvelope,
  LoginPayload,
  RequestPasswordResetPayload,
  ResendConfirmationPayload,
  ResetPasswordPayload,
  SignupPayload,
} from '@/types/api'
import type { AuthUser } from '@/features/auth/types'

/** Map the backend (snake_case) user object to the app's `AuthUser`. */
function mapUser(
  user: AuthUserResponse & { needs_username?: boolean },
): AuthUser {
  return {
    id: String(user.id),
    email: user.email,
    username: user.username,
    isAdmin: user.admin,
    avatarUrl: user.avatar_url,
    timezone: user.timezone,
    confirmedAt: user.confirmed_at,
    // login/signup/reset don't send needs_username; a missing username is the
    // only way to need one, so fall back to that.
    needsUsername: user.needs_username ?? user.username === null,
  }
}

/**
 * Typed wrappers around the cookie-based auth endpoints. Every call goes
 * through the shared axios client (`withCredentials`), so the session cookie
 * and CSRF token are handled by interceptors. Failures reject with the axios
 * error; callers use `getApiError` to read the backend `{ code, message }`.
 */
export const authApi = {
  async login(payload: LoginPayload): Promise<AuthUser> {
    const { user } = await post<AuthUserResponseEnvelope>(
      '/auth/login',
      payload,
    )
    return mapUser(user)
  },

  async signup(payload: SignupPayload): Promise<AuthUser> {
    const { user } = await post<AuthUserResponseEnvelope>(
      '/auth/signup',
      payload,
    )
    return mapUser(user)
  },

  async logout(): Promise<void> {
    await del('/auth/logout')
  },

  async requestPasswordReset(
    payload: RequestPasswordResetPayload,
  ): Promise<void> {
    // Always 202; the backend never reveals whether the email exists.
    await post('/auth/password', payload)
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<AuthUser> {
    const { user } = await put<AuthUserResponseEnvelope>(
      '/auth/password',
      payload,
    )
    return mapUser(user)
  },

  /**
   * Confirm an email via its token. The email link itself hits this endpoint
   * directly (the backend redirects the browser to `/confirm-email?status=…`),
   * so the SPA usually just reads that status; this wrapper exists for flows
   * that confirm programmatically.
   */
  async confirmEmail(token: string): Promise<void> {
    await get('/auth/confirmation', { params: { confirmation_token: token } })
  },

  async resendConfirmation(payload: ResendConfirmationPayload): Promise<void> {
    await post('/auth/confirmation', payload)
  },

  /** Current user, or null when there is no active session (401). */
  async getMe(): Promise<AuthUser | null> {
    try {
      const { user } = await get<AuthMeResponse>('/auth/me')
      return mapUser(user)
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        return null
      }
      throw error
    }
  },
}

/**
 * Extract the backend error object (`{ code, message, details }`) from a
 * rejected request, or null if the error isn't a recognised API error envelope.
 */
export function getApiError(error: unknown): ApiError | null {
  if (!isAxiosError(error)) return null

  const body = error.response?.data as ApiErrorResponse | undefined
  const inner = body?.error
  if (inner && typeof inner.code === 'string') {
    return inner
  }
  return null
}
