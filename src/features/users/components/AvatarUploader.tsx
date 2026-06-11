import { initialsOf } from '@/features/users/initials'

export interface AvatarUploaderProps {
  avatarUrl: string | null
  username: string | null
  email: string
  /** Visual size in px (default 80). */
  size?: number
}

/**
 * Display-only profile avatar (SCRUM-199). Shows the user's photo (e.g. from
 * Google) or their initials. Click-to-upload was removed pending a fix for the
 * upload bug (SCRUM-310); re-enable the camera affordance + Cloudinary handler
 * here once that ticket lands.
 */
export function AvatarUploader({
  avatarUrl,
  username,
  email,
  size = 80,
}: AvatarUploaderProps) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full"
      style={{ width: size, height: size }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="size-full object-cover" />
      ) : (
        <span
          className="bg-brand-primary font-display flex size-full items-center justify-center font-bold text-white"
          style={{ fontSize: size * 0.34 }}
        >
          {initialsOf(username, email)}
        </span>
      )}
    </div>
  )
}
