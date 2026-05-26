import type { RankingEntry } from '@/types/domain'

// Stubs — implemented in feature tickets.
export const rankingsApi = {
  global(): Promise<RankingEntry[]> {
    throw new Error('Not implemented')
  },
  group(): Promise<RankingEntry[]> {
    throw new Error('Not implemented')
  },
}
