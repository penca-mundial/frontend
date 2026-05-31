import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { PhaseBadge } from '@/features/matches/components/PhaseBadge'
import type { Match, MatchTeam } from '@/features/matches/types'
import { isMatchLocked } from '@/features/matches/utils'
import { formatKickoffTime } from '@/lib/date'
import { detectUserTimezone } from '@/lib/timezone'
import { cn } from '@/lib/cn'

export interface MatchCardProps {
  match: Match
  timezone?: string
}

interface StatusDescriptor {
  label: string
  textClass: string
  dotClass: string
}

/** Visual status of a match for the list card (icon colour + label). */
function describeStatus(match: Match): StatusDescriptor {
  switch (match.status) {
    case 'live':
      return { label: 'En vivo', textClass: 'text-live', dotClass: 'bg-live' }
    case 'finished':
      return {
        label: 'Finalizado',
        textClass: 'text-text-secondary',
        dotClass: 'bg-text-disabled',
      }
    case 'postponed':
      return {
        label: 'Pospuesto',
        textClass: 'text-warning',
        dotClass: 'bg-warning',
      }
    case 'cancelled':
      return {
        label: 'Cancelado',
        textClass: 'text-text-disabled',
        dotClass: 'bg-text-disabled',
      }
    default:
      return isMatchLocked(match)
        ? {
            label: 'Cerrado',
            textClass: 'text-text-secondary',
            dotClass: 'bg-text-disabled',
          }
        : {
            label: 'Abierto',
            textClass: 'text-success',
            dotClass: 'bg-success',
          }
  }
}

function TeamRow({
  team,
  score,
  showScore,
}: {
  team: MatchTeam | null
  score: number | null
  showScore: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex min-w-0 items-center gap-2">
        {team?.flagUrl ? (
          <img
            src={team.flagUrl}
            alt=""
            className="size-5 shrink-0 rounded-sm object-cover"
          />
        ) : (
          <span className="text-text-secondary text-mono-mini w-5 shrink-0 text-center">
            {team?.code3 ?? '—'}
          </span>
        )}
        <span className="text-body truncate font-medium">
          {team?.name ?? 'Por definir'}
        </span>
      </span>
      {showScore && score !== null ? (
        <span className="text-mono-mini tabular-nums">{score}</span>
      ) : null}
    </div>
  )
}

/**
 * Compact, tappable fixture card for the match list. Links to the match detail
 * (`/app/matches/:id`); shows the phase, kickoff time, a colour-coded status
 * indicator, both teams (with the real score once live/finished) and the
 * user's prediction when present.
 */
export function MatchCard({
  match,
  timezone = detectUserTimezone(),
}: MatchCardProps) {
  const status = describeStatus(match)
  const showScore = match.status === 'live' || match.status === 'finished'

  return (
    <Link
      to={`/app/matches/${match.id}`}
      className="focus-visible:ring-ring block rounded-lg focus-visible:ring-2 focus-visible:outline-none"
    >
      <Card className="hover:border-border-strong gap-3 p-4 transition-colors">
        <div className="flex items-center justify-between gap-2">
          <PhaseBadge phase={match.phase} />
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-body-sm font-medium',
              status.textClass,
            )}
          >
            <span className={cn('size-2 rounded-full', status.dotClass)} />
            {status.label}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <TeamRow
            team={match.homeTeam}
            score={match.homeScore}
            showScore={showScore}
          />
          <TeamRow
            team={match.awayTeam}
            score={match.awayScore}
            showScore={showScore}
          />
        </div>

        <div className="text-text-secondary flex items-center justify-between text-body-sm">
          <span>{formatKickoffTime(match.kickoffAt, timezone)}</span>
          {match.myPrediction ? (
            <span>
              Tu pronóstico{' '}
              <span className="text-text-primary text-mono-mini font-semibold">
                {match.myPrediction.predictedHomeScore}-
                {match.myPrediction.predictedAwayScore}
              </span>
            </span>
          ) : null}
        </div>
      </Card>
    </Link>
  )
}
