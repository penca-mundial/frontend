import { patch, post } from '@/api/client'
import type { AuthUserResponse } from '@/types/api'
import type { AuthUser } from '@/features/auth/types'

/**
 * Editable profile fields the SPA sends. `timezone` is intentionally omitted:
 * it is not consumed server-side, so the profile no longer manages it
 * (SCRUM-199); the app auto-detects the browser zone for display.
 */
export interface UpdateProfilePayload {
  username?: string
  avatarUrl?: string
}

/** Map the backend (snake_case) user to the app's `AuthUser` (ids → string). */
function mapUser(user: AuthUserResponse): AuthUser {
  return {
    id: String(user.id),
    email: user.email,
    username: user.username,
    isAdmin: user.admin,
    avatarUrl: user.avatar_url,
    timezone: user.timezone,
    confirmedAt: user.confirmed_at,
    needsUsername: user.username === null,
  }
}

export const usersApi = {
  /**
   * Update the current user's editable profile (`PATCH /users/me`). Only the
   * provided keys are sent (snake_case); `timezone` is never sent. Returns the
   * refreshed user so the caller can update auth state.
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
    const body: Record<string, string> = {}
    if (payload.username !== undefined) body.username = payload.username
    if (payload.avatarUrl !== undefined) body.avatar_url = payload.avatarUrl

    const data = await patch<{ user: AuthUserResponse }>('/users/me', body)
    return mapUser(data.user)
  },

  /**
   * Claim a username for an OAuth-provisioned account that hasn't picked one
   * yet (the post-Google onboarding step). POSTs to /users/me/username; the
   * caller refetches the session afterwards. Rejects with the axios error
   * (e.g. 409 username_already_set, 422 validation_error) for the form to map.
   */
  async setUsername(username: string): Promise<void> {
    await post('/users/me/username', { username })
  },
}
