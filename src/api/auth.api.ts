import type { User } from '@/types/domain'

// Stubs — implemented in feature tickets.
export const authApi = {
  me(): Promise<User> {
    throw new Error('Not implemented')
  },
  login(): Promise<User> {
    throw new Error('Not implemented')
  },
  signup(): Promise<User> {
    throw new Error('Not implemented')
  },
  logout(): Promise<void> {
    throw new Error('Not implemented')
  },
}
