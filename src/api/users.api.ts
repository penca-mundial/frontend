import { post } from '@/api/client'
import type { User } from '@/types/domain'

export const usersApi = {
  // Stubs — implemented in feature tickets.
  get(): Promise<User> {
    throw new Error('Not implemented')
  },
  updateProfile(): Promise<User> {
    throw new Error('Not implemented')
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
