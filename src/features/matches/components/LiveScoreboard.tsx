import type { Match } from '@/features/matches/types'

export interface LiveScoreboardProps {
  match: Match
}

/**
 * Big live score, shown only while a match is in play. The match query polls
 * every 12s (see useMatch), so this updates on its own.
 */
export function LiveScoreboard({ match }: LiveScoreboardProps) {
  return (
    <section
      aria-label="Resultado en vivo"
      className="bg-surface-muted flex flex-col items-center gap-2 rounded-lg py-6"
    >
      <span className="text-live inline-flex items-center gap-2 text-mono-mini font-semibold">
        <span className="bg-live size-2 animate-pulse rounded-full" />
        EN VIVO
      </span>
      <div className="text-mono-score flex items-center gap-4 tabular-nums">
        <span>{match.homeScore ?? 0}</span>
        <span className="text-text-disabled">-</span>
        <span>{match.awayScore ?? 0}</span>
      </div>
    </section>
  )
}
