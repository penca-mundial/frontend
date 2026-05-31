import type { Match } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'

/** Outcome of a prediction relative to the (finished) match result. */
export type PredictionResultStatus = 'exact' | 'partial' | 'wrong' | 'pending'

const SIGN = (home: number, away: number): number =>
  home > away ? 1 : home < away ? -1 : 0

/**
 * Classify a prediction against its match result:
 * - `pending`  — the match hasn't finished (or has no score yet).
 * - `exact`    — the predicted score matches exactly.
 * - `partial`  — the outcome (home win / draw / away win) is right but the
 *                score isn't.
 * - `wrong`    — the outcome is wrong.
 * The backend doesn't expose per-match points yet, so this is derived locally.
 */
export function predictionResultStatus(
  prediction: Prediction,
  match: Match | undefined,
): PredictionResultStatus {
  if (
    !match ||
    match.status !== 'finished' ||
    match.homeScore === null ||
    match.awayScore === null
  ) {
    return 'pending'
  }
  const exact =
    prediction.predictedHomeScore === match.homeScore &&
    prediction.predictedAwayScore === match.awayScore
  if (exact) return 'exact'
  return SIGN(prediction.predictedHomeScore, prediction.predictedAwayScore) ===
    SIGN(match.homeScore, match.awayScore)
    ? 'partial'
    : 'wrong'
}

export const RESULT_STATUS_LABEL: Record<PredictionResultStatus, string> = {
  exact: 'Exacto',
  partial: 'Parcial',
  wrong: 'Erróneo',
  pending: 'Pendiente',
}
