import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BrandSurface } from '@/components/brand/BrandSurface'
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
 * The profile identity banner: the same teal textured surface as the home hero
 * (`BrandSurface`), with the avatar + username as the protagonist and the global
 * standing ("N.º X de Y · Z pts") as the eyebrow line below. Degrades to a
 * friendly line when the user has no ranked position yet. The viewer's own
 * profile is not a special case — it just gets a "· vos" marker.
 */
export function UserProfileHeader({
  user,
  ranking,
  isMe = false,
}: UserProfileHeaderProps) {
  return (
    <BrandSurface className="shadow-sm">
      <div className="flex items-center gap-4 p-5">
        <Avatar
          size="lg"
          className="ring-2 ring-white/40 ring-offset-2 ring-offset-brand-primary"
        >
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
          <AvatarFallback className="bg-white/15 text-white">
            {initials(user.username)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-wide text-white/85 uppercase">
            {ranking.rankPosition != null
              ? `N.º ${ranking.rankPosition} de ${ranking.total} · ${ranking.points} pts`
              : 'Sin posición en el ranking general'}
          </p>
          <h1 className="font-display text-display-md flex items-baseline gap-2 font-semibold">
            <span className="truncate">{user.username ?? 'Jugador'}</span>
            {isMe && <span className="text-base text-white/70">· vos</span>}
          </h1>
        </div>
      </div>
    </BrandSurface>
  )
}
