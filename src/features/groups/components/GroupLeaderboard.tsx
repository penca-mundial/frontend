import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useGroupLeaderboard } from '@/features/groups/hooks/useGroupLeaderboard'
import type { RankingEntry } from '@/types/domain'
import { cn } from '@/lib/cn'

/** Gold / silver / bronze tints for the top-3 medals. */
const MEDAL: Record<number, string> = {
  1: 'bg-[#fde68a] text-[#92400e]',
  2: 'bg-[#e5e7eb] text-[#374151]',
  3: 'bg-[#fed7aa] text-[#9a3412]',
}

function Position({ position }: { position: number }) {
  if (position <= 3) {
    return (
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full text-body-sm font-bold tabular-nums',
          MEDAL[position],
        )}
      >
        {position}
      </span>
    )
  }
  return (
    <span className="text-text-secondary w-7 shrink-0 text-center text-body-sm font-semibold tabular-nums">
      {position}
    </span>
  )
}

function initials(username: string | null): string {
  return username ? username.slice(0, 2).toUpperCase() : '?'
}

function LeaderboardRow({
  entry,
  isMe,
}: {
  entry: RankingEntry
  isMe: boolean
}) {
  return (
    <li
      className={cn(
        'relative flex items-center gap-3 overflow-hidden rounded-lg border px-3 py-2',
        isMe
          ? 'border-brand-primary/40 bg-brand-primary-soft/40'
          : 'border-border bg-surface',
      )}
    >
      {isMe && (
        <span
          aria-hidden="true"
          className="bg-brand-primary absolute inset-y-0 left-0 w-1"
        />
      )}
      <Position position={entry.position} />
      <Avatar size="sm">
        {entry.avatarUrl && <AvatarImage src={entry.avatarUrl} alt="" />}
        <AvatarFallback>{initials(entry.username)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-body-sm truncate font-semibold">
          {entry.username ?? 'Jugador'}
          {isMe && <span className="text-brand-primary"> · vos</span>}
        </p>
        <p className="text-text-secondary text-xs">
          {entry.exactCount} {entry.exactCount === 1 ? 'exacto' : 'exactos'}
        </p>
      </div>
      <span className="font-display shrink-0 font-bold tabular-nums">
        {entry.points}
        <span className="text-text-secondary text-xs font-normal"> pts</span>
      </span>
    </li>
  )
}

export interface GroupLeaderboardProps {
  groupId: string
}

/**
 * The group's ranking: top rows plus the current user's own row, always
 * visible — highlighted in place when in the top, or pinned at the bottom
 * (from the `me` window) with a separator when ranked lower. Pagination
 * ("Ver más jugadores") is a follow-up (SCRUM-280).
 */
export function GroupLeaderboard({ groupId }: GroupLeaderboardProps) {
  const { currentUser } = useCurrentUser()
  const { data, isLoading, isError } = useGroupLeaderboard(groupId)

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

  const entries = data?.entries ?? []
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
      ? (data?.me.find((e) => e.userId === myId) ?? null)
      : null

  return (
    <ol className="flex flex-col gap-1.5">
      {entries.map((entry) => (
        <LeaderboardRow
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
          <LeaderboardRow entry={pinnedMe} isMe />
        </>
      )}
    </ol>
  )
}
