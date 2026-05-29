import { useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { authApi, getApiError } from '@/api/auth.api'
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from '@/features/auth/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * @param token The `reset_password_token` read from the URL by the page. When
 * null the link is malformed; the form short-circuits to the invalid state.
 */
export function ResetPasswordForm({ token }: { token: string | null }) {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [tokenInvalid, setTokenInvalid] = useState(false)
  const passwordErrorId = useId()
  const confirmErrorId = useId()

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
  })

  useEffect(() => {
    if (token) setFocus('password')
  }, [token, setFocus])

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!token) {
      setTokenInvalid(true)
      return
    }
    try {
      await authApi.resetPassword({
        reset_password_token: token,
        password: values.password,
      })
      navigate('/login?reset=success', { replace: true })
    } catch (error) {
      const code = getApiError(error)?.code
      if (code === 'token_invalid' || code === 'token_expired') {
        setTokenInvalid(true)
      } else if (code === 'validation_error') {
        // Devise rejected the new password (too weak / pwned / too short).
        setError('password', {
          message:
            'Esa contraseña no es válida. Probá con una más segura (y que no haya aparecido en filtraciones).',
        })
      } else {
        setError('password', {
          message: 'Algo salió mal. Probá de nuevo en un momento.',
        })
      }
    }
  }

  if (!token || tokenInvalid) {
    return <InvalidTokenNotice />
  }

  const passwordError = errors.password?.message
  const confirmError = errors.passwordConfirm?.message

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Restablecer contraseña"
    >
      <div className="mb-3.5">
        <Label htmlFor="reset-password" className="text-text-primary mb-1.5">
          Nueva contraseña
        </Label>
        <div className="relative">
          <Input
            id="reset-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            className="pr-10"
            aria-invalid={Boolean(passwordError) || undefined}
            aria-describedby={passwordError ? passwordErrorId : undefined}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={
              showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
            className="text-text-disabled hover:text-text-secondary absolute inset-y-0 right-0 inline-flex items-center px-3"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {passwordError && (
          <FieldError id={passwordErrorId}>{passwordError}</FieldError>
        )}
      </div>

      <div className="mb-4">
        <Label
          htmlFor="reset-password-confirm"
          className="text-text-primary mb-1.5"
        >
          Repetí la nueva contraseña
        </Label>
        <Input
          id="reset-password-confirm"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          aria-invalid={Boolean(confirmError) || undefined}
          aria-describedby={confirmError ? confirmErrorId : undefined}
          {...register('passwordConfirm')}
        />
        {confirmError && (
          <FieldError id={confirmErrorId}>{confirmError}</FieldError>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Guardando…' : 'Guardar contraseña'}
      </Button>
    </form>
  )
}

function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <p
      id={id}
      role="alert"
      className="text-danger mt-1.5 inline-flex items-center gap-1.5 text-[11.5px] leading-snug"
    >
      <AlertCircle size={12} strokeWidth={2} aria-hidden="true" />
      {children}
    </p>
  )
}

function InvalidTokenNotice() {
  return (
    <div className="text-center" role="alert">
      <div className="bg-danger-soft text-danger mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full">
        <AlertCircle size={24} strokeWidth={2} aria-hidden="true" />
      </div>
      <h2 className="font-display text-text-primary text-xl font-bold tracking-tight">
        Este enlace ya no sirve
      </h2>
      <p className="text-text-secondary mx-auto mt-2 max-w-[320px] text-sm leading-relaxed">
        El enlace para restablecer la contraseña es inválido o expiró. Pedí uno
        nuevo y volvé a intentar.
      </p>
      <Button asChild size="lg" className="mt-5 w-full">
        <Link to="/forgot-password">Pedir un nuevo enlace</Link>
      </Button>
    </div>
  )
}
