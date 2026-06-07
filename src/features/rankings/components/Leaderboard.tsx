import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { LeaderboardEntry } from '@/features/rankings/components/LeaderboardEntry'
import type { RankingEntry } from '@/types/domain'

export interface LeaderboardProps {
  /** Top rows, already ranked (ties share a position: 1, 1, 1, 4). */
  entries: RankingEntry[]
  /** The `me` window (current user's row + neighbours) from `include_me`. */
  me: RankingEntry[]
  isLoading?: boolean
  isError?: boolean
}

/**
 * A ranking table (global or per group): top rows plus the current user's own
 * row, always visible — highlighted in place when in the top, or pinned at
 * the bottom (from the `me` window) with a separator when ranked lower.
 * Purely presentational: the caller fetches the slice (via `useRanking`).
 * Pagination ("Ver más jugadores") is a follow-up (SCRUM-280).
 */
export function Leaderboard({
  entries,
  me,
  isLoading = false,
  isError = false,
}: LeaderboardProps) {
  const { currentUser } = useCurrentUser()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1.5" aria-busy="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-danger text-body">
        No pudimos cargar el ranking. Intentá de nuevo.
      </p>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="border-border bg-surface rounded-xl border border-dashed p-8 text-center">
        <p className="text-text-primary text-body font-semibold">
          Todavía no hay posiciones
        </p>
        <p className="text-text-secondary text-body-sm mx-auto mt-1 max-w-sm">
          El ranking aparece cuando empiezan a sumarse los puntos del Mundial.
        </p>
      </div>
    )
  }

  const myId = currentUser?.id ?? null
  const meInTop = myId !== null && entries.some((e) => e.userId === myId)
  // Pin the user's own row at the bottom only when they're not already shown.
  const pinnedMe =
    myId !== null && !meInTop
      ? (me.find((e) => e.userId === myId) ?? null)
      : null

  return (
    <ol className="flex flex-col gap-1.5">
      {entries.map((entry) => (
        <LeaderboardEntry
          key={entry.userId}
          entry={entry}
          isMe={entry.userId === myId}
        />
      ))}
      {pinnedMe && (
        <>
          <li
            aria-hidden="true"
            className="text-text-disabled py-1 text-center text-body-sm"
          >
            ···
          </li>
          <LeaderboardEntry entry={pinnedMe} isMe />
        </>
      )}
    </ol>
  )
}
