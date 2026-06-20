import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type {
  ProfileGlobalRanking,
  PublicProfileUser,
} from '@/features/users/types'

function initials(username: string | null): string {
  return username ? username.slice(0, 2).toUpperCase() : '?'
}

export interface UserProfileHeaderProps {
  user: PublicProfileUser
  ranking: ProfileGlobalRanking
  /** Whether this profile belongs to the signed-in viewer. */
  isMe?: boolean
}

/**
 * The profile header: avatar + bare username + the viewed user's global
 * standing ("N.º X de Y · Z pts"). Degrades to a friendly line when the user has
 * no ranked position yet. The viewer's own profile is not a special case — it
 * just gets a "· vos" marker.
 */
export function UserProfileHeader({
  user,
  ranking,
  isMe = false,
}: UserProfileHeaderProps) {
  return (
    <header className="flex items-center gap-4">
      <Avatar size="lg">
        {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
        <AvatarFallback>{initials(user.username)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <h1 className="font-display flex items-baseline gap-2 text-2xl font-bold">
          <span className="truncate">{user.username ?? 'Jugador'}</span>
          {isMe && (
            <span className="text-brand-primary text-base font-semibold">
              · vos
            </span>
          )}
        </h1>
        <p className="text-text-secondary text-body-sm">
          {ranking.rankPosition != null ? (
            <>
              N.º {ranking.rankPosition} de {ranking.total} ·{' '}
              <span className="text-text-primary font-semibold">
                {ranking.points} pts
              </span>
            </>
          ) : (
            'Todavía sin posición en el ranking general'
          )}
        </p>
      </div>
    </header>
  )
}
