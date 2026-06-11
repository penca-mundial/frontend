import type { Match, MatchTeam } from '@/features/matches/types'
import { cn } from '@/lib/cn'

/** Flag box — the team flag, falling back to its 3-letter code when imageless. */
function Flag({ team }: { team: MatchTeam | null }) {
  if (team?.flagUrl) {
    return (
      <span className="inline-flex h-9 w-[54px] shrink-0 overflow-hidden rounded-[4px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] sm:h-[56px] sm:w-[84px]">
        <img src={team.flagUrl} alt="" className="block size-full object-cover" />
      </span>
    )
  }
  return (
    <span className="bg-surface-muted text-text-secondary inline-flex h-9 w-[54px] shrink-0 items-center justify-center rounded-[4px] text-[11px] sm:h-[56px] sm:w-[84px]">
      {team?.code3 ?? '—'}
    </span>
  )
}

/** One side: flag + team name, left- or right-aligned (the score sits centre). */
function TeamInfo({
  team,
  align,
}: {
  team: MatchTeam | null
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
      <span className="text-body truncate font-semibold leading-tight">
        {team?.name ?? 'Por definir'}
      </span>
    </div>
  )
}

/** A score digit, tall enough to span the flag + name stack. */
function Score({ value }: { value: number | null }) {
  return (
    <span className="font-display text-4xl leading-none font-bold tabular-nums sm:text-6xl">
      {value ?? 0}
    </span>
  )
}

/**
 * The shared dashboard scoreboard: flag + team name on each outer side, with the
 * two big scores centred and flanking the "–". Used by both the live card and
 * the finished-result cards so their match rows stay identical.
 */
export function MatchScoreboard({ match }: { match: Match }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <TeamInfo team={match.homeTeam} align="left" />
      <div className="flex items-center gap-4 sm:gap-16">
        <Score value={match.homeScore} />
        <span className="text-text-disabled text-xl sm:text-2xl">–</span>
        <Score value={match.awayScore} />
      </div>
      <TeamInfo team={match.awayTeam} align="right" />
    </div>
  )
}
