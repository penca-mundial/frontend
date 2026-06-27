import { useQuery } from '@tanstack/react-query'
import { predictionsApi } from '@/api/predictions.api'
import type { Prediction } from '@/features/predictions/types'

/**
 * All of the current user's predictions, indexed by match id. Pages through
 * `/predictions/me` completely (see `predictionsApi.listAll`) so a consumer can
 * look up a pick by match without worrying about pagination — used by the
 * bracket to surface the viewer's predicted score on open knockout crosses,
 * which the gated `/bracket` payload omits until lock.
 *
 * Lives in the `['predictions', ...]` namespace invalidated after an upsert, so
 * a new pick refreshes the map. Caller gates `enabled` to authed viewers.
 */
export function useAllMyPredictions(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['predictions', 'all'],
    queryFn: async (): Promise<Map<string, Prediction>> => {
      const predictions = await predictionsApi.listAll()
      return new Map(predictions.map((prediction) => [prediction.matchId, prediction]))
    },
    enabled: options?.enabled ?? true,
  })
}
