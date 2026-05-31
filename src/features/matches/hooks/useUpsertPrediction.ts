import { useMutation, useQueryClient } from '@tanstack/react-query'
import { predictionsApi } from '@/api/predictions.api'
import type { UpsertPredictionPayload } from '@/types/api'

/**
 * Upsert the current user's prediction (`PUT /predictions`). On success it
 * invalidates the match detail, the fixture list and the predictions list so
 * every view reflects the new prediction.
 */
export function useUpsertPrediction(matchId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpsertPredictionPayload) =>
      predictionsApi.upsert(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['match', matchId] })
      void queryClient.invalidateQueries({ queryKey: ['matches'] })
      void queryClient.invalidateQueries({ queryKey: ['predictions'] })
    },
  })
}
