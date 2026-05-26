import type { Prediction } from '@/types/domain'

// Stubs — implemented in feature tickets.
export const predictionsApi = {
  list(): Promise<Prediction[]> {
    throw new Error('Not implemented')
  },
  upsert(): Promise<Prediction> {
    throw new Error('Not implemented')
  },
}
