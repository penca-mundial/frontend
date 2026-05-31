import { Card } from '@/components/ui/card'
import type { Match } from '@/features/matches/types'
import {
  advancingPredictionOutcome,
  isKnockoutPhase,
} from '@/features/matches/utils'

export interface PredictionLockProps {
  match: Match
}

function ScoreLine({
  label,
  home,
  away,
}: {
  label: string
  home: number
  away: number
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-secondary text-body-sm">{label}</span>
      <span className="text-mono-mini font-semibold tabular-nums">
        {home}-{away}
      </span>
    </div>
  )
}

/**
 * Read-only view for a locked or finished match: the user's submitted
 * prediction, the real result (when finished), and a breakdown of what they got
 * right. The backend doesn't expose per-match points yet, so the points line is
 * shown as pending once the match is finished.
 */
export function PredictionLock({ match }: PredictionLockProps) {
  const prediction = match.myPrediction
  const finished = match.status === 'finished'
  const knockout = isKnockoutPhase(match.phase)

  if (!prediction) {
    return (
      <Card className="items-center gap-2 p-6 text-center">
        <p className="text-text-secondary text-body">
          No pronosticaste este partido.
        </p>
        {finished && match.homeScore !== null && match.awayScore !== null ? (
          <p className="text-mono-mini font-semibold tabular-nums">
            Resultado {match.homeScore}-{match.awayScore}
          </p>
        ) : (
          <p className="text-text-disabled text-body-sm">
            Los pronósticos están cerrados.
          </p>
        )}
      </Card>
    )
  }

  const exactScore =
    finished &&
    prediction.predictedHomeScore === match.homeScore &&
    prediction.predictedAwayScore === match.awayScore
  const advancingOutcome = advancingPredictionOutcome(match)

  return (
    <Card className="gap-3 p-6">
      <ScoreLine
        label="Tu pronóstico"
        home={prediction.predictedHomeScore}
        away={prediction.predictedAwayScore}
      />
      {finished && match.homeScore !== null && match.awayScore !== null ? (
        <ScoreLine
          label="Resultado"
          home={match.homeScore}
          away={match.awayScore}
        />
      ) : null}

      {finished && (
        <div className="border-border flex flex-col gap-1 border-t pt-3">
          <span
            className={exactScore ? 'text-success text-body-sm' : 'text-text-secondary text-body-sm'}
          >
            {exactScore ? '✓ Resultado exacto' : 'No acertaste el resultado exacto'}
          </span>
          {knockout && advancingOutcome ? (
            <span
              className={
                advancingOutcome === 'correct'
                  ? 'text-success text-body-sm'
                  : 'text-text-secondary text-body-sm'
              }
            >
              {advancingOutcome === 'correct'
                ? '✓ Acertaste quién pasa de ronda'
                : 'No acertaste quién pasa de ronda'}
            </span>
          ) : null}
          <span className="text-text-disabled text-body-sm">
            Puntaje disponible cuando se calcule.
          </span>
        </div>
      )}
    </Card>
  )
}
