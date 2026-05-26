import type { PhaseMultiplier, ScoringRule } from '@/types/domain'

// Stubs — implemented in feature tickets.
export const adminApi = {
  scoringRules(): Promise<ScoringRule[]> {
    throw new Error('Not implemented')
  },
  phaseMultipliers(): Promise<PhaseMultiplier[]> {
    throw new Error('Not implemented')
  },
}
