import { apiClient, put } from '@/api/client'
import type { PredictionResponse, UpsertPredictionPayload } from '@/types/api'
import type { Prediction } from '@/features/predictions/types'

export interface PredictionListResult {
  predictions: Prediction[]
  totalCount: number
  page: number
  perPage: number
}

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
   * The current user's predictions (`GET /predictions/me`, paginated). The
   * backend renders a bare JSON array and exposes the total via the
   * `X-Total-Count` header. Only prediction data is returned (no match info) —
   * callers join against the matches list to display results.
   */
  async list(page = 1, perPage = 20): Promise<PredictionListResult> {
    const response = await apiClient.get<PredictionResponse[]>(
      '/predictions/me',
      { params: { page, per_page: perPage } },
    )
    const totalHeader = response.headers['x-total-count']
    return {
      predictions: response.data.map(mapPrediction),
      totalCount: totalHeader ? Number(totalHeader) : response.data.length,
      page,
      perPage,
    }
  },

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
