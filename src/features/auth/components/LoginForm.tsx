import { useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { authApi, getApiError } from '@/api/auth.api'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { loginSchema, type LoginValues } from '@/features/auth/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/cn'

/**
 * Login server-side outcomes that aren't field errors. The backend reports
 * them via the error envelope `code`; we keep the failing email around so the
 * "resend confirmation" affordance can reuse it.
 */
type ServerError =
  | { kind: 'invalid_credentials' }
  | { kind: 'email_not_confirmed'; email: string }
  | { kind: 'account_banned' }
  | { kind: 'unknown' }

const GENERIC_COPY: Record<
  Exclude<ServerError['kind'], 'email_not_confirmed'>,
  string
> = {
  invalid_credentials: 'El email o la contraseña no coinciden.',
  account_banned:
    'Esta cuenta está suspendida. Si creés que es un error, escribí a soporte.',
  unknown: 'Algo salió mal. Probá de nuevo en un momento.',
}

export function LoginForm() {
  const navigate = useNavigate()
  const { refetch } = useCurrentUser()
  const [serverError, setServerError] = useState<ServerError | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>(
    'idle',
  )

  const passwordErrorId = useId()

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  })

  // Automatic focus on the first field without the inaccessible autoFocus prop.
  useEffect(() => {
    setFocus('email')
  }, [setFocus])

  const onSubmit = async (values: LoginValues) => {
    setServerError(null)
    setResendState('idle')
    try {
      await authApi.login(values)
      refetch()
      navigate('/app/home', { replace: true })
    } catch (error) {
      const apiError = getApiError(error)
      switch (apiError?.code) {
        case 'invalid_credentials':
          setServerError({ kind: 'invalid_credentials' })
          break
        case 'email_not_confirmed':
          setServerError({ kind: 'email_not_confirmed', email: values.email })
          break
        case 'account_banned':
          setServerError({ kind: 'account_banned' })
          break
        default:
          setServerError({ kind: 'unknown' })
      }
    }
  }

  const handleResend = async (email: string) => {
    setResendState('sending')
    try {
      await authApi.resendConfirmation({ email })
    } finally {
      // The endpoint always 202s; show the confirmation regardless.
      setResendState('sent')
    }
  }

  const emailError = errors.email?.message
  const passwordError = errors.password?.message

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Iniciar sesión"
    >
      {serverError && (
        <ServerErrorAlert
          error={serverError}
          resendState={resendState}
          onResend={handleResend}
        />
      )}

      <div className="mb-3.5">
        <Label htmlFor="login-email" className="text-text-primary mb-1.5">
          Email
        </Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="vos@ejemplo.com"
          aria-invalid={Boolean(emailError) || undefined}
          aria-describedby={emailError ? 'login-email-error' : undefined}
          {...register('email')}
        />
        {emailError && (
          <FieldError id="login-email-error">{emailError}</FieldError>
        )}
      </div>

      <div className="mb-4">
        <div className="mb-1.5 flex items-baseline justify-between">
          <Label htmlFor="login-password" className="text-text-primary">
            Contraseña
          </Label>
          <Link
            to="/forgot-password"
            className="text-brand-primary text-[12.5px] font-semibold hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
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

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Ingresando…' : 'Ingresar'}
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

function ServerErrorAlert({
  error,
  resendState,
  onResend,
}: {
  error: ServerError
  resendState: 'idle' | 'sending' | 'sent'
  onResend: (email: string) => void
}) {
  return (
    <div
      role="alert"
      className={cn(
        'bg-danger-soft mb-4 rounded-[10px] border border-[#FCA5A5] px-3.5 py-3 text-[12.5px] leading-relaxed text-[#991B1B]',
      )}
    >
      {error.kind === 'email_not_confirmed' ? (
        <div className="space-y-2">
          <p>Necesitás confirmar tu email antes de entrar.</p>
          {resendState === 'sent' ? (
            <p className="font-semibold">
              Listo, te reenviamos el email de confirmación.
            </p>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={resendState === 'sending'}
              onClick={() => onResend(error.email)}
            >
              {resendState === 'sending'
                ? 'Reenviando…'
                : 'Reenviar email de confirmación'}
            </Button>
          )}
        </div>
      ) : (
        <p>{GENERIC_COPY[error.kind]}</p>
      )}
    </div>
  )
}
