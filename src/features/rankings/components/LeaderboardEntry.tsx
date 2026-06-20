import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

export interface LeaderboardEntryProps {
  entry: RankingEntry
  isMe: boolean
}

/**
 * One leaderboard row: medal (top-3) or plain rank, avatar, username (bare,
 * no `@`), exact-predictions count, and points. The current user's row gets a
 * teal accent bar + tint and a "· vos" suffix.
 */
export function LeaderboardEntry({ entry, isMe }: LeaderboardEntryProps) {
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
      <Link
        to={`/app/users/${entry.userId}`}
        className="focus-visible:ring-ring flex min-w-0 flex-1 items-center gap-3 rounded-md hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
      >
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
      </Link>
      <span className="font-display shrink-0 font-bold tabular-nums">
        {entry.points}
        <span className="text-text-secondary text-xs font-normal"> pts</span>
      </span>
    </li>
  )
}
