import { DashboardCard } from '@/features/home/components/DashboardCard'
import { MatchScoreboard } from '@/features/home/components/MatchScoreboard'
import type { Match } from '@/features/matches/types'
import { getPhaseLabel, LIVE_MATCH_CARD_BORDER } from '@/features/matches/utils'
import { formatKickoff } from '@/lib/date'
import { detectUserTimezone } from '@/lib/timezone'

/** "EN VIVO · 67'" pill — red dot + label, mirroring the fixture status badge. */
function LiveBadge({ minute }: { minute: number | null | undefined }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[11px] font-semibold text-[#991B1B]">
      <span className="bg-live size-1.5 animate-pulse rounded-full" aria-hidden="true" />
      EN VIVO{minute != null ? ` · ${minute}'` : ''}
    </span>
  )
}

export interface LiveMatchCardProps {
  match: Match
  timezone?: string
}

/**
 * "Ahora mismo" live card in the mock's layout: the shared `MatchScoreboard`
 * (flag + team name, big centred scores), the group/kickoff meta (no venue — we
 * don't have it), a live badge, and the user's "Pronosticaste X – Y · Si termina
 * así, +Z pts" line. Read-only: no "Ver detalle" link. The red live border
 * reuses the Fixture's shared `LIVE_MATCH_CARD_BORDER`. The prediction/projection
 * only show once `my_prediction` and `projected_points` ride the live payload
 * (backend, in parallel); they degrade to nothing until then.
 */
export function LiveMatchCard({ match, timezone }: LiveMatchCardProps) {
  const tz = timezone ?? detectUserTimezone()
  const prediction = match.myPrediction ?? null

  return (
    <DashboardCard
      title="Ahora mismo"
      headerRight={<LiveBadge minute={match.minute} />}
      className={LIVE_MATCH_CARD_BORDER}
    >
      <div className="flex flex-col gap-3">
        <MatchScoreboard match={match} />

        <div className="border-border border-t border-dashed" />

        <div className="text-text-secondary flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase">
          <span>
            {match.group ? `Grupo ${match.group}` : getPhaseLabel(match.phase)}
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            {formatKickoff(match.kickoffAt, 'time', tz)}
          </span>
        </div>

        {prediction && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-brand-accent-soft inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide text-[#854D0E] uppercase">
              Pronosticaste
              <span className="font-bold">
                {prediction.predictedHomeScore} – {prediction.predictedAwayScore}
              </span>
            </span>
            {match.projectedPoints != null && (
              <span className="text-text-secondary text-body-sm">
                Si termina así,{' '}
                <span className="text-text-primary font-semibold">
                  {match.projectedPoints} pts
                </span>
              </span>
            )}
          </div>
        )}
      </div>
    </DashboardCard>
  )
}
