import { get, put } from '@/api/client'
import type {
  TournamentPredictionResponse,
  UpsertTournamentPredictionPayload,
} from '@/types/api'
import type { TournamentPrediction } from '@/features/tournament-predictions/types'

const idOrNull = (value: number | null): string | null =>
  value === null ? null : String(value)

/** Map the backend (snake_case) tournament prediction to the domain type. */
function mapTournamentPrediction(
  prediction: TournamentPredictionResponse,
): TournamentPrediction {
  return {
    id: String(prediction.id),
    tournamentId: String(prediction.tournament_id),
    championId: idOrNull(prediction.champion_id),
    runnerUpId: idOrNull(prediction.runner_up_id),
    thirdPlaceId: idOrNull(prediction.third_place_id),
    fourthPlaceId: idOrNull(prediction.fourth_place_id),
    topScorerId: idOrNull(prediction.top_scorer_id),
    lockedAt: prediction.locked_at,
    locked: prediction.locked,
  }
}

export const tournamentPredictionsApi = {
  /**
   * The current user's tournament prediction (`GET /tournament_predictions/me`).
   * Resolves to `null` when they haven't made one yet (the endpoint returns a
   * bare `null`).
   */
  async me(): Promise<TournamentPrediction | null> {
    const data = await get<TournamentPredictionResponse | null>(
      '/tournament_predictions/me',
    )
    return data ? mapTournamentPrediction(data) : null
  },

  /**
   * Create or update the tournament prediction (`PUT /tournament_predictions`).
   * Body is the FLAT set of (optional) podium + top-scorer ids — not wrapped.
   */
  async upsert(
    payload: UpsertTournamentPredictionPayload,
  ): Promise<TournamentPrediction> {
    return mapTournamentPrediction(
      await put<TournamentPredictionResponse>(
        '/tournament_predictions',
        payload,
      ),
    )
  },
}
