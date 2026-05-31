/**
 * A user's prediction for a single match, as the app consumes it: camelCase,
 * derived from the backend `PredictionBlueprint`. `locked` is computed by the
 * backend from the match state so the UI can disable editing without a second
 * round-trip.
 */
export interface Prediction {
  id: string
  matchId: string
  predictedHomeScore: number
  predictedAwayScore: number
  /** Only set for knockout predictions; null for the group stage. */
  predictedAdvancingTeamId: string | null
  /** ISO 8601 timestamp once the prediction is hard-locked, else null. */
  lockedAt: string | null
  locked: boolean
}
