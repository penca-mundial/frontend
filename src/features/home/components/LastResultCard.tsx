import { Check, X } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardCard } from '@/features/home/components/DashboardCard'
import { useLastFinishedMatch } from '@/features/home/hooks/useLastFinishedMatch'
import type { Match, MatchTeam } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'
import { getPhaseLabel } from '@/features/matches/utils'
import { predictionResultStatus } from '@/features/predictions/utils'
import { formatKickoff } from '@/lib/date'
import { detectUserTimezone } from '@/lib/timezone'
import { cn } from '@/lib/cn'

function Flag({ team }: { team: MatchTeam | null }) {
  if (team?.flagUrl) {
    return (
      <span className="inline-flex h-[22px] w-[30px] shrink-0 overflow-hidden rounded-[3px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]">
        <img src={team.flagUrl} alt="" className="block size-full object-cover" />
      </span>
    )
  }
  return (
    <span className="bg-surface-muted text-text-secondary inline-flex h-[22px] w-[30px] shrink-0 items-center justify-center rounded-[3px] text-[10px]">
      {team?.code3 ?? '—'}
    </span>
  )
}

function TeamRow({ team, score }: { team: MatchTeam | null; score: number | null }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-2">
        <Flag team={team} />
        <span className="truncate text-body font-semibold">
          {team?.name ?? 'Por definir'}
        </span>
      </span>
      <span className="font-display text-body-lg font-bold tabular-nums">
        {score ?? '—'}
      </span>
    </div>
  )
}

/** Outcome of the user's prediction, as a colored badge. No prediction → null. */
function OutcomeBadge({ match, prediction }: { match: Match; prediction: Prediction }) {
  const status = predictionResultStatus(prediction, match)
  const hit = status === 'exact' || status === 'partial'
  const label = status === 'exact' ? '¡Exacto!' : status === 'partial' ? 'Acertaste' : 'Errado'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
        hit ? 'bg-success-soft text-[#166534]' : 'bg-danger-soft text-[#991B1B]',
      )}
    >
      {hit ? <Check size={11} strokeWidth={2.5} /> : <X size={11} strokeWidth={2.5} />}
      {label}
    </span>
  )
}

export interface LastResultCardProps {
  timezone?: string
}

/**
 * "Último resultado": the most recent finished match, its final score, and the
 * user's prediction vs. the result with an outcome badge (Acertaste / Errado).
 * Per-match points aren't exposed by the backend yet, so the badge stands in
 * for them (see backend gap — points pending). Degrades to an empty note until
 * `/matches/last_finished` ships.
 */
export function LastResultCard({ timezone = detectUserTimezone() }: LastResultCardProps) {
  const { match, isLoading } = useLastFinishedMatch()
  const prediction = match?.myPrediction ?? null

  return (
    <DashboardCard title="Último resultado">
      {isLoading ? (
        <Skeleton className="h-28 w-full rounded-xl" />
      ) : match ? (
        <div className="flex flex-col gap-3">
          <span className="text-text-secondary text-[11px] font-semibold tracking-wide uppercase">
            {match.group ? `Grupo ${match.group}` : getPhaseLabel(match.phase)}
            {' · '}
            {formatKickoff(match.kickoffAt, 'date', timezone)}
          </span>

          <div className="flex flex-col gap-2">
            <TeamRow team={match.homeTeam} score={match.homeScore} />
            <TeamRow team={match.awayTeam} score={match.awayScore} />
          </div>

          <div className="border-border flex items-center justify-between gap-2 border-t border-dashed pt-2">
            {prediction ? (
              <>
                <span className="text-text-secondary text-body-sm">
                  Tu pronóstico: {prediction.predictedHomeScore} –{' '}
                  {prediction.predictedAwayScore}
                </span>
                <OutcomeBadge match={match} prediction={prediction} />
              </>
            ) : (
              <span className="text-text-secondary text-body-sm">
                No pronosticaste este partido.
              </span>
            )}
          </div>
        </div>
      ) : (
        <p className="text-text-secondary text-body-sm">
          Todavía no hay partidos finalizados.
        </p>
      )}
    </DashboardCard>
  )
}
