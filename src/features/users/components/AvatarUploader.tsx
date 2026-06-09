import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { AvatarUploadError, uploadAvatar } from '@/api/cloudinary.api'
import { useUpdateProfile } from '@/features/users/hooks/useUpdateProfile'
import { initialsOf } from '@/features/users/initials'
import { toast } from '@/hooks/useToast'
import { cn } from '@/lib/cn'

export interface AvatarUploaderProps {
  avatarUrl: string | null
  username: string | null
  email: string
  /** Visual size in px (default 80). */
  size?: number
}

/**
 * Click-to-upload avatar (SCRUM-199). Shows the photo or the user's initials;
 * on hover, a subtle overlay + a camera badge invite a change. Picking a file
 * validates it (image/*, ≤5 MB) and uploads to Cloudinary (unsigned), then
 * persists the URL via `PATCH /users/me { avatar_url }`. The just-uploaded image
 * shows optimistically while auth refetches. Errors surface as a toast.
 */
export function AvatarUploader({
  avatarUrl,
  username,
  email,
  size = 80,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [optimisticUrl, setOptimisticUrl] = useState<string | null>(null)
  const { mutateAsync, isPending } = useUpdateProfile()

  const shownUrl = optimisticUrl ?? avatarUrl

  async function handleFile(file: File | undefined) {
    if (!file) return
    try {
      const url = await uploadAvatar(file)
      setOptimisticUrl(url) // optimistic: show it before the refetch lands
      await mutateAsync({ avatarUrl: url })
      toast({ title: 'Foto de perfil actualizada' })
    } catch (error) {
      setOptimisticUrl(null)
      const message =
        error instanceof AvatarUploadError
          ? error.message
          : 'No pudimos actualizar tu foto. Probá de nuevo.'
      toast({ title: message, variant: 'destructive' })
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        aria-label="Cambiar foto de perfil"
        className="group focus-visible:ring-ring relative block size-full overflow-hidden rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        {shownUrl ? (
          <img
            src={shownUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <span
            className="bg-brand-primary font-display flex size-full items-center justify-center font-bold text-white"
            style={{ fontSize: size * 0.34 }}
          >
            {initialsOf(username, email)}
          </span>
        )}

        {/* Hover overlay */}
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-black/35 text-white opacity-0 transition-opacity',
            isPending ? 'opacity-100' : 'group-hover:opacity-100',
          )}
        >
          {isPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Camera className="size-5" />
          )}
        </span>
      </button>

      {/* Camera badge, bottom-right */}
      <span
        aria-hidden="true"
        className="border-surface bg-brand-primary absolute right-0 bottom-0 inline-flex size-6 items-center justify-center rounded-full border-2 text-white"
      >
        <Camera className="size-3" />
      </span>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
