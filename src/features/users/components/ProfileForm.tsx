import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getApiError } from '@/api/auth.api'
import { profileSchema, type ProfileValues } from '@/features/users/schemas'
import { useUpdateProfile } from '@/features/users/hooks/useUpdateProfile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/useToast'

export interface ProfileFormProps {
  /** Current username to pre-fill (null for OAuth users who haven't picked one). */
  username: string | null
}

/**
 * Username editor for the profile "Información" section (SCRUM-199). RHF + Zod,
 * the shared `[a-z0-9_]{3,20}` rule, and a discreet help line — no `@`
 * adornment. Saves via `PATCH /users/me`; a taken username (422) maps back onto
 * the field instead of a toast.
 */
export function ProfileForm({ username }: ProfileFormProps) {
  const hintId = useId()
  const errorId = useId()
  const { mutateAsync, isPending } = useUpdateProfile()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onBlur',
    defaultValues: { username: username ?? '' },
  })

  const usernameError = errors.username?.message

  const onSubmit = async (values: ProfileValues) => {
    try {
      await mutateAsync({ username: values.username })
      toast({ title: 'Perfil actualizado' })
    } catch (error) {
      const apiError = getApiError(error)
      if (apiError?.code === 'username_already_set') {
        setError('username', { message: 'Ese nombre de usuario ya está en uso.' })
        return
      }
      if (apiError?.code === 'validation_error') {
        setError('username', {
          message: 'Entre 3 y 20 caracteres: minúsculas, números o guion bajo.',
        })
        return
      }
      toast({
        title: 'No pudimos guardar los cambios. Probá de nuevo.',
        variant: 'destructive',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-sm">
      <Label htmlFor="profile-username" className="text-text-primary mb-1.5">
        Nombre de usuario
      </Label>
      <Input
        id="profile-username"
        autoComplete="username"
        aria-invalid={Boolean(usernameError) || undefined}
        aria-describedby={usernameError ? `${hintId} ${errorId}` : hintId}
        {...register('username')}
      />
      {usernameError ? (
        <p
          id={errorId}
          role="alert"
          className="text-danger mt-1.5 text-[11.5px] leading-snug"
        >
          {usernameError}
        </p>
      ) : (
        <p
          id={hintId}
          className="text-text-secondary mt-1.5 text-[11.5px] leading-snug"
        >
          Entre 3 y 20 caracteres: minúsculas, números o guion bajo.
        </p>
      )}

      <Button
        type="submit"
        size="sm"
        className="mt-4"
        disabled={isPending || !isDirty}
      >
        {isPending ? 'Guardando…' : 'Guardar cambios'}
      </Button>
    </form>
  )
}
