import type { Player } from '@/types/domain'

// Stubs — implemented in feature tickets.
export const playersApi = {
  list(): Promise<Player[]> {
    throw new Error('Not implemented')
  },
  get(): Promise<Player> {
    throw new Error('Not implemented')
  },
}
