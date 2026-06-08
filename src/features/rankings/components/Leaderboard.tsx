import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { LeaderboardEntry } from '@/features/rankings/components/LeaderboardEntry'
import type { RankingEntry } from '@/types/domain'

export interface LeaderboardProps {
  /** Loaded rows, already ranked (ties share a position: 1, 1, 1, 4). */
  entries: RankingEntry[]
  /** The `me` window (current user's row + neighbours) from `include_me`. */
  me: RankingEntry[]
  isLoading?: boolean
  isError?: boolean
  /** True while more pages exist — shows "Ver más jugadores" (SCRUM-280). */
  hasMore?: boolean
  /** Loads-and-appends the next page; required for the button to render. */
  onLoadMore?: () => void
  /** Disables the button with a loading label while the next page fetches. */
  isLoadingMore?: boolean
}

/**
 * A ranking table (global or per group): the loaded rows plus the current
 * user's own row, always visible — highlighted in place when loaded, or
 * pinned at the bottom (from the `me` window) with a separator when ranked
 * past the loaded depth. Purely presentational: the caller fetches the pages
 * (via `useRanking`) and wires "Ver más jugadores" through
 * `hasMore`/`onLoadMore` (SCRUM-280).
 */
export function Leaderboard({
  entries,
  me,
  isLoading = false,
  isError = false,
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
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
    <div className="flex flex-col gap-3">
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
      {hasMore && onLoadMore && (
        <Button
          variant="outline"
          size="sm"
          onClick={onLoadMore}
          disabled={isLoadingMore}
          className="w-full sm:w-auto sm:self-center"
        >
          {isLoadingMore ? 'Cargando…' : 'Ver más jugadores'}
        </Button>
      )}
    </div>
  )
}
