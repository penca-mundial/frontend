import type { Match, MatchTeam } from '@/features/matches/types'
import { getPhaseLabel } from '@/features/matches/utils'
import { predictionResultStatus } from '@/features/predictions/utils'
import { formatKickoff } from '@/lib/date'
import { detectUserTimezone } from '@/lib/timezone'
import { cn } from '@/lib/cn'

type ResultCategory = 'exact' | 'partial' | 'wrong' | 'none'

/**
 * A subtle top-to-bottom wash per outcome category: the pastel tint is hinted at
 * the top and fades to the card surface by the bottom (not a flat saturated
 * fill). Green exact / yellow winner / red wrong; neutral with no prediction.
 */
const CATEGORY_CARD: Record<ResultCategory, string> = {
  exact:
    'bg-gradient-to-b from-success-soft/70 via-surface via-30% to-surface border-success/15',
  partial:
    'bg-gradient-to-b from-warning-soft/70 via-surface via-30% to-surface border-warning/20',
  wrong:
    'bg-gradient-to-b from-danger-soft/70 via-surface via-30% to-surface border-danger/15',
  none: 'bg-surface border-border',
}

/** Outcome category for the card background (none when the user didn't predict). */
function categoryOf(match: Match): ResultCategory {
  const prediction = match.myPrediction
  if (!prediction) return 'none'
  const status = predictionResultStatus(prediction, match)
  return status === 'pending' ? 'none' : status
}

/** Flag box — the team flag, falling back to its 3-letter code when imageless. */
function Flag({ team }: { team: MatchTeam | null }) {
  if (team?.flagUrl) {
    return (
      <span className="inline-flex h-[20px] w-[30px] shrink-0 overflow-hidden rounded-[3px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]">
        <img src={team.flagUrl} alt="" className="block size-full object-cover" />
      </span>
    )
  }
  return (
    <span className="bg-surface-muted text-text-secondary inline-flex h-[20px] w-[30px] shrink-0 items-center justify-center rounded-[3px] text-[10px]">
      {team?.code3 ?? '—'}
    </span>
  )
}

/** One compact row: flag + team name on the left, the score on the right. */
function TeamRow({ team, score }: { team: MatchTeam | null; score: number | null }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-2.5">
        <Flag team={team} />
        <span className="text-body truncate font-semibold">
          {team?.name ?? 'Por definir'}
        </span>
      </span>
      <span className="font-display text-body-lg font-bold tabular-nums">
        {score ?? '—'}
      </span>
    </div>
  )
}

export interface ResultCardProps {
  match: Match
  /** Show the "Último resultado" eyebrow — only on the most recent card. */
  showEyebrow?: boolean
  timezone?: string
}

/**
 * One finished-match result card in the compact "último resultado" layout
 * (stacked team rows, score on the right). The outcome category colours the
 * whole card background (green exact / yellow winner / red wrong), so the points
 * chip stays neutral — just "+X pts". The most recent card carries the "Último
 * resultado" eyebrow; the rest repeat the same card without it. Points come from
 * `my_prediction.points`; the chip hides until the backend scores it.
 */
export function ResultCard({ match, showEyebrow = false, timezone }: ResultCardProps) {
  const tz = timezone ?? detectUserTimezone()
  const prediction = match.myPrediction ?? null
  const points = prediction?.points
  const matchup = `${match.homeTeam?.name ?? 'Local'} ${match.homeScore ?? 0} - ${match.awayScore ?? 0} ${match.awayTeam?.name ?? 'Visitante'}`

  return (
    <section
      aria-label={matchup}
      className={cn(
        'flex flex-col gap-3 rounded-xl border p-4',
        CATEGORY_CARD[categoryOf(match)],
      )}
    >
      {showEyebrow && (
        <h2 className="text-text-secondary text-[11px] font-semibold tracking-wide uppercase">
          Último resultado
        </h2>
      )}

      <div className="text-text-secondary flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase">
        <span>
          {match.group ? `Grupo ${match.group}` : getPhaseLabel(match.phase)}
        </span>
        <span aria-hidden="true">·</span>
        <span>{formatKickoff(match.kickoffAt, 'date', tz)}</span>
      </div>

      <div className="flex flex-col gap-2">
        <TeamRow team={match.homeTeam} score={match.homeScore} />
        <TeamRow team={match.awayTeam} score={match.awayScore} />
      </div>

      {prediction && (
        <div className="flex items-center justify-between gap-2">
          <span className="bg-surface/70 text-text-secondary inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase">
            Pronosticaste
            <span className="text-text-primary font-bold">
              {prediction.predictedHomeScore} – {prediction.predictedAwayScore}
            </span>
          </span>
          {points != null && (
            <span className="bg-surface/70 text-text-primary inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums">
              +{points} pts
            </span>
          )}
        </div>
      )}
    </section>
  )
}
