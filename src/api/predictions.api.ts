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
    // Present on finished-match payloads once scored; null otherwise.
    points: prediction.points ?? null,
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
   * Every prediction of the current user, across all pages. `/predictions/me`
   * is paginated; we page through until `X-Total-Count` is covered (and stop on
   * an empty page) so callers — e.g. the bracket merging picks into open
   * knockout crosses — get the complete set, not just the first 20. Pages are
   * fetched sequentially; the per-user total is small and bounded.
   */
  async listAll(): Promise<Prediction[]> {
    const PER_PAGE = 100
    const all: Prediction[] = []
    for (let page = 1; ; page += 1) {
      const result = await predictionsApi.list(page, PER_PAGE)
      all.push(...result.predictions)
      if (result.predictions.length === 0 || all.length >= result.totalCount) {
        break
      }
    }
    return all
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
