import { DashboardCard } from '@/features/home/components/DashboardCard'
import type { Match, MatchTeam } from '@/features/matches/types'
import { getPhaseLabel } from '@/features/matches/utils'
import { formatKickoff } from '@/lib/date'
import { detectUserTimezone } from '@/lib/timezone'
import { cn } from '@/lib/cn'

/** "EN VIVO · 67'" pill — red dot + label, mirroring the fixture status badge. */
function LiveBadge({ minute }: { minute: number | null | undefined }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[11px] font-semibold text-[#991B1B]">
      <span className="bg-live size-1.5 animate-pulse rounded-full" aria-hidden="true" />
      EN VIVO{minute != null ? ` · ${minute}'` : ''}
    </span>
  )
}

/** Flag box — the team flag, falling back to its 3-letter code when imageless. */
function Flag({ team }: { team: MatchTeam | null }) {
  if (team?.flagUrl) {
    return (
      <span className="inline-flex h-[22px] w-[32px] overflow-hidden rounded-[3px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]">
        <img src={team.flagUrl} alt="" className="block size-full object-cover" />
      </span>
    )
  }
  return (
    <span className="bg-surface-muted text-text-secondary inline-flex h-[22px] w-[32px] items-center justify-center rounded-[3px] text-[10px]">
      {team?.code3 ?? '—'}
    </span>
  )
}

/** One side: flag, team name, big score — left- or right-aligned. */
function TeamColumn({
  team,
  score,
  align,
}: {
  team: MatchTeam | null
  score: number | null
  align: 'left' | 'right'
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-1.5',
        align === 'right' && 'items-end text-right',
      )}
    >
      <Flag team={team} />
      <span className="text-body-lg truncate font-semibold leading-tight">
        {team?.name ?? 'Por definir'}
      </span>
      <span className="font-display text-4xl leading-none font-bold tabular-nums">
        {score ?? 0}
      </span>
    </div>
  )
}

export interface LiveMatchCardProps {
  match: Match
  timezone?: string
}

/**
 * "Ahora mismo" live card in the mock's layout: flag + team name (no country
 * code) and a big score per side, the group/kickoff meta (no venue — we don't
 * have it), a live badge, and the user's "Pronosticaste X – Y" pill. Read-only:
 * no "Ver detalle" link and no live points projection (not exposed yet). The
 * prediction pill only shows once `my_prediction` rides the match — pending on
 * `/matches/live` (backend follow-up); it degrades to no pill until then.
 */
export function LiveMatchCard({ match, timezone }: LiveMatchCardProps) {
  const tz = timezone ?? detectUserTimezone()
  const prediction = match.myPrediction ?? null

  return (
    <DashboardCard title="Ahora mismo" headerRight={<LiveBadge minute={match.minute} />}>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <TeamColumn team={match.homeTeam} score={match.homeScore} align="left" />
          <span className="text-text-disabled text-body-lg">–</span>
          <TeamColumn team={match.awayTeam} score={match.awayScore} align="right" />
        </div>

        <div className="border-border border-t border-dashed" />

        <div className="text-text-secondary flex items-center gap-2 text-body-sm">
          <span className="bg-surface-muted rounded-full px-2 py-0.5 text-[11px] font-semibold">
            {match.group ? `Grupo ${match.group}` : getPhaseLabel(match.phase)}
          </span>
          <span className="tabular-nums">{formatKickoff(match.kickoffAt, 'time', tz)}</span>
        </div>

        {prediction && (
          <span className="bg-brand-accent-soft inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-body-sm font-semibold text-[#854D0E]">
            Pronosticaste {prediction.predictedHomeScore} –{' '}
            {prediction.predictedAwayScore}
          </span>
        )}
      </div>
    </DashboardCard>
  )
}
