import type { Match } from '@/types/domain'

// Stubs — implemented in feature tickets.
export const matchesApi = {
  list(): Promise<Match[]> {
    throw new Error('Not implemented')
  },
  get(): Promise<Match> {
    throw new Error('Not implemented')
  },
}
