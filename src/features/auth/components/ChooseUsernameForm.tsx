import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { AlertCircle, Check } from 'lucide-react'
import { usersApi } from '@/api/users.api'
import { getApiError } from '@/api/auth.api'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { takeReturnTo } from '@/features/auth/returnTo'
import { USERNAME_PATTERN } from '@/features/auth/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const chooseUsernameSchema = z.object({
  username: z
    .string()
    .min(1, 'Elegí un nombre de usuario.')
    .regex(
      USERNAME_PATTERN,
      'Entre 3 y 20 caracteres: minúsculas, números o guion bajo.',
    ),
})
type ChooseUsernameValues = z.infer<typeof chooseUsernameSchema>

export function ChooseUsernameForm() {
  const navigate = useNavigate()
  const { refetch } = useCurrentUser()

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChooseUsernameValues>({
    resolver: zodResolver(chooseUsernameSchema),
    mode: 'onBlur',
  })

  useEffect(() => {
    setFocus('username')
  }, [setFocus])

  const usernameValue = watch('username') ?? ''
  const usernameLooksValid = USERNAME_PATTERN.test(usernameValue)

  const onSubmit = async (values: ChooseUsernameValues) => {
    try {
      await usersApi.setUsername(values.username)
      refetch()
      // Resume the invite destination stashed before OAuth, if any.
      navigate(takeReturnTo() ?? '/app/home', { replace: true })
    } catch (error) {
      const apiError = getApiError(error)
      if (apiError?.code === 'username_already_set') {
        // Already has a username — nothing to do here, send them in.
        refetch()
        navigate(takeReturnTo() ?? '/app/home', { replace: true })
        return
      }
      const message = apiError?.details?.errors?.[0]
      setError('username', {
        message:
          message ??
          'No pudimos guardar ese nombre. Probá con otro en un momento.',
      })
    }
  }

  const usernameError = errors.username?.message

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Elegir nombre de usuario"
    >
      <div className="mb-4">
        <Label
          htmlFor="onboarding-username"
          className="text-text-primary mb-1.5"
        >
          Nombre de usuario
        </Label>
        <div className="relative">
          <Input
            id="onboarding-username"
            autoComplete="username"
            placeholder="tu_usuario"
            className="pr-10"
            aria-invalid={Boolean(usernameError) || undefined}
            aria-describedby={
              usernameError
                ? 'onboarding-username-error'
                : 'onboarding-username-hint'
            }
            {...register('username')}
          />
          {usernameLooksValid && !usernameError && (
            <span
              className="text-success absolute inset-y-0 right-0 inline-flex items-center px-3"
              aria-hidden="true"
            >
              <Check size={16} strokeWidth={2.5} />
            </span>
          )}
        </div>
        {usernameError ? (
          <p
            id="onboarding-username-error"
            role="alert"
            className="text-danger mt-1.5 inline-flex items-center gap-1.5 text-[11.5px] leading-snug"
          >
            <AlertCircle size={12} strokeWidth={2} aria-hidden="true" />
            {usernameError}
          </p>
        ) : (
          <p
            id="onboarding-username-hint"
            className="text-text-secondary mt-1.5 text-[11.5px] leading-snug"
          >
            Así te van a ver el resto de los jugadores. No se puede cambiar
            seguido, elegí bien.
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Guardando…' : 'Continuar'}
      </Button>
    </form>
  )
}
