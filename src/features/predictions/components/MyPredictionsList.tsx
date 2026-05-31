import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { PhaseBadge } from '@/features/matches/components/PhaseBadge'
import type { Match } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'
import {
  predictionResultStatus,
  RESULT_STATUS_LABEL,
  type PredictionResultStatus,
} from '@/features/predictions/utils'
import { cn } from '@/lib/cn'

export interface PredictionRow {
  prediction: Prediction
  match: Match | undefined
}

export interface MyPredictionsListProps {
  rows: PredictionRow[]
}

const STATUS_CLASS: Record<PredictionResultStatus, string> = {
  exact: 'bg-success-soft text-success',
  partial: 'bg-warning-soft text-warning',
  wrong: 'bg-danger-soft text-danger',
  pending: 'bg-surface-muted text-text-secondary',
}

function StatusChip({ status }: { status: PredictionResultStatus }) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-body-sm font-medium',
        STATUS_CLASS[status],
      )}
    >
      {RESULT_STATUS_LABEL[status]}
    </span>
  )
}

function matchTitle(match: Match | undefined): string {
  if (!match) return 'Partido'
  return `${match.homeTeam?.name ?? 'Por definir'} vs ${match.awayTeam?.name ?? 'Por definir'}`
}

/** Table-like list of the user's predictions with result and outcome status. */
export function MyPredictionsList({ rows }: MyPredictionsListProps) {
  return (
    <ul className="flex flex-col gap-3">
      {rows.map(({ prediction, match }) => {
        const status = predictionResultStatus(prediction, match)
        const finished = match?.status === 'finished'
        const inner = (
          <Card className="gap-2 p-4">
            <div className="flex items-center justify-between gap-2">
              {match ? <PhaseBadge phase={match.phase} /> : <span />}
              <StatusChip status={status} />
            </div>
            <p className="text-body font-medium">{matchTitle(match)}</p>
            <div className="text-text-secondary flex items-center gap-4 text-body-sm">
              <span>
                Tu pronóstico{' '}
                <span className="text-text-primary text-mono-mini font-semibold">
                  {prediction.predictedHomeScore}-
                  {prediction.predictedAwayScore}
                </span>
              </span>
              {finished &&
              match?.homeScore !== null &&
              match?.awayScore !== null ? (
                <span>
                  Resultado{' '}
                  <span className="text-text-primary text-mono-mini font-semibold">
                    {match.homeScore}-{match.awayScore}
                  </span>
                </span>
              ) : null}
            </div>
          </Card>
        )
        return (
          <li key={prediction.id}>
            {match ? (
              <Link
                to={`/app/matches/${match.id}`}
                className="focus-visible:ring-ring block rounded-lg focus-visible:ring-2 focus-visible:outline-none"
              >
                {inner}
              </Link>
            ) : (
              inner
            )}
          </li>
        )
      })}
    </ul>
  )
}
