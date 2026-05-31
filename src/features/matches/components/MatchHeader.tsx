import { PhaseBadge } from '@/features/matches/components/PhaseBadge'
import type { Match, MatchTeam } from '@/features/matches/types'
import { formatKickoff } from '@/lib/date'

export interface MatchHeaderProps {
  match: Match
  timezone: string
}

function Team({ team }: { team: MatchTeam | null }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      {team?.flagUrl ? (
        <img
          src={team.flagUrl}
          alt=""
          className="size-12 rounded-md object-cover"
        />
      ) : (
        <span className="bg-surface-muted text-text-secondary text-mono-mini flex size-12 items-center justify-center rounded-md">
          {team?.code3 ?? '—'}
        </span>
      )}
      <span className="text-body text-center font-semibold">
        {team?.name ?? 'Por definir'}
      </span>
    </div>
  )
}

/** Match detail header: phase, both teams with flags, and the kickoff date. */
export function MatchHeader({ match, timezone }: MatchHeaderProps) {
  return (
    <header className="flex flex-col items-center gap-4">
      <PhaseBadge phase={match.phase} />
      <div className="flex w-full max-w-md items-start justify-between gap-4">
        <Team team={match.homeTeam} />
        <span className="text-text-disabled self-center text-body-lg">vs</span>
        <Team team={match.awayTeam} />
      </div>
      <p className="text-text-secondary text-body-sm">
        {formatKickoff(match.kickoffAt, 'full', timezone)}
      </p>
    </header>
  )
}
