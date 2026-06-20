import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BrandSurface } from '@/components/brand/BrandSurface'
import type { PublicProfileUser } from '@/features/users/types'

function initials(username: string | null): string {
  return username ? username.slice(0, 2).toUpperCase() : '?'
}

export interface UserProfileHeaderProps {
  user: PublicProfileUser
  /** Whether this profile belongs to the signed-in viewer. */
  isMe?: boolean
}

/**
 * The profile identity banner: the same teal textured surface as the home hero
 * (`BrandSurface`), with the avatar + username. The global standing lives in the
 * "Pencas en común" general-pool row, so it is not repeated here. The viewer's
 * own profile is not a special case — it just gets a "· vos" marker.
 */
export function UserProfileHeader({
  user,
  isMe = false,
}: UserProfileHeaderProps) {
  return (
    <BrandSurface className="shadow-sm">
      <div className="flex items-center gap-4 p-5">
        <Avatar
          size="lg"
          className="ring-offset-brand-primary ring-2 ring-white/40 ring-offset-2"
        >
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
          <AvatarFallback className="bg-white/15 text-white">
            {initials(user.username)}
          </AvatarFallback>
        </Avatar>
        <h1 className="font-display text-display-md flex items-baseline gap-2 font-semibold">
          <span className="truncate">{user.username ?? 'Jugador'}</span>
          {isMe && <span className="text-base text-white/70">· vos</span>}
        </h1>
      </div>
    </BrandSurface>
  )
}
