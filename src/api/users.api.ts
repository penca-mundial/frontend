import type { User } from '@/types/domain'

// Stubs — implemented in feature tickets.
export const usersApi = {
  get(): Promise<User> {
    throw new Error('Not implemented')
  },
  updateProfile(): Promise<User> {
    throw new Error('Not implemented')
  },
}
