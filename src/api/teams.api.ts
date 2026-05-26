import type { Team } from '@/types/domain'

// Stubs — implemented in feature tickets.
export const teamsApi = {
  list(): Promise<Team[]> {
    throw new Error('Not implemented')
  },
  get(): Promise<Team> {
    throw new Error('Not implemented')
  },
}
