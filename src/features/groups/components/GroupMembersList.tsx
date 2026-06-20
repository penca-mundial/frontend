import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useGroupMembers } from '@/features/groups/hooks/useGroupMembers'
import type { GroupMember } from '@/types/domain'
import { formatKickoff } from '@/lib/date'
import { detectUserTimezone } from '@/lib/timezone'
import { cn } from '@/lib/cn'

function initials(username: string | null): string {
  return username ? username.slice(0, 2).toUpperCase() : '?'
}

function MemberRow({
  member,
  isMe,
  timezone,
}: {
  member: GroupMember
  isMe: boolean
  timezone: string
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
      <Link
        to={`/app/users/${member.userId}`}
        className="focus-visible:ring-ring flex min-w-0 flex-1 items-center gap-3 rounded-md hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
      >
        <Avatar size="sm">
          {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt="" />}
          <AvatarFallback>{initials(member.username)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-body-sm truncate font-semibold">
            {member.username ?? 'Jugador'}
            {isMe && <span className="text-brand-primary"> · vos</span>}
          </p>
          <p className="text-text-secondary text-xs">
            Se unió el {formatKickoff(member.joinedAt, 'date', timezone)}
          </p>
        </div>
      </Link>
      {member.isOwner && <Badge variant="outline">owner</Badge>}
    </li>
  )
}

export interface GroupMembersListProps {
  groupId: string
}

/**
 * The penca's member list (`GET /groups/:id/members`): avatar, bare username,
 * owner badge and join date, with the current user's row highlighted (matched
 * by id). Paginated — "Ver más miembros" appends the next page.
 */
export function GroupMembersList({ groupId }: GroupMembersListProps) {
  const timezone = detectUserTimezone()
  const { currentUser } = useCurrentUser()
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGroupMembers(groupId)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1.5" aria-busy="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-danger text-body">
        No pudimos cargar los miembros. Intentá de nuevo.
      </p>
    )
  }

  const members = data?.pages.flatMap((page) => page.members) ?? []
  if (members.length === 0) {
    return (
      <div className="border-border bg-surface rounded-xl border border-dashed p-8 text-center">
        <p className="text-text-primary text-body font-semibold">
          Todavía no hay miembros
        </p>
        <p className="text-text-secondary text-body-sm mx-auto mt-1 max-w-sm">
          Compartí el código para que se sumen.
        </p>
      </div>
    )
  }

  const myId = currentUser?.id ?? null

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-1.5">
        {members.map((member) => (
          <MemberRow
            key={member.userId}
            member={member}
            isMe={member.userId === myId}
            timezone={timezone}
          />
        ))}
      </ul>
      {hasNextPage && (
        <Button
          variant="outline"
          className="self-center"
          onClick={() => void fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Cargando…' : 'Ver más miembros'}
        </Button>
      )}
    </div>
  )
}
