import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tournamentPredictionsApi } from '@/api/tournament-predictions.api'
import type { UpsertTournamentPredictionPayload } from '@/types/api'

export const TOURNAMENT_PREDICTION_KEY = ['tournament-prediction']

/**
 * The current user's tournament prediction plus the upsert mutation. Reading
 * (`me()`) and writing (`upsert`) share the `['tournament-prediction']` key, so
 * a successful upsert invalidates the read and every view re-syncs.
 */
export function useTournamentPrediction() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: TOURNAMENT_PREDICTION_KEY,
    queryFn: () => tournamentPredictionsApi.me(),
  })

  const upsert = useMutation({
    mutationFn: (payload: UpsertTournamentPredictionPayload) =>
      tournamentPredictionsApi.upsert(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: TOURNAMENT_PREDICTION_KEY,
      })
    },
  })

  return { query, upsert }
}
