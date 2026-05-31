import { put } from '@/api/client'
import type { PredictionResponse, UpsertPredictionPayload } from '@/types/api'
import type { Prediction } from '@/features/predictions/types'

/** Map the backend (snake_case, numeric ids) prediction to the domain type. */
export function mapPrediction(prediction: PredictionResponse): Prediction {
  return {
    id: String(prediction.id),
    matchId: String(prediction.match_id),
    predictedHomeScore: prediction.predicted_home_score,
    predictedAwayScore: prediction.predicted_away_score,
    predictedAdvancingTeamId:
      prediction.predicted_advancing_team_id === null
        ? null
        : String(prediction.predicted_advancing_team_id),
    lockedAt: prediction.locked_at,
    locked: prediction.locked,
  }
}

export const predictionsApi = {
  /**
   * Create or update the current user's prediction for a match
   * (`PUT /predictions`, idempotent upsert). Rejects with the axios error on
   * validation failure; callers read it via `getApiError`.
   */
  async upsert(payload: UpsertPredictionPayload): Promise<Prediction> {
    const response = await put<PredictionResponse>('/predictions', payload)
    return mapPrediction(response)
  },
}
