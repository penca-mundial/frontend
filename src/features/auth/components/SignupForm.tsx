import { useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { AlertCircle, Check, Eye, EyeOff, MailCheck } from 'lucide-react'
import { authApi, getApiError } from '@/api/auth.api'
import {
  signupSchema,
  USERNAME_PATTERN,
  type SignupValues,
} from '@/features/auth/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * Spread the backend validation messages (already-translated full messages in
 * `details.errors`) onto the field they belong to, keyword-matching the
 * attribute prefix so it survives copy tweaks. Anything unmatched bubbles up as
 * a generic message.
 */
function distributeErrors(messages: string[]) {
  const buckets: {
    email?: string
    username?: string
    password?: string
    generic?: string
  } = {}
  for (const message of messages) {
    const lower = message.toLowerCase()
    if (/mail/.test(lower)) buckets.email ??= message
    else if (/usuari|username/.test(lower)) buckets.username ??= message
    else if (/contrase|password/.test(lower)) buckets.password ??= message
    else buckets.generic ??= message
  }
  return buckets
}

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [genericError, setGenericError] = useState<string | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const passwordErrorId = useId()
  const passwordHintId = useId()
  const confirmErrorId = useId()

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
  })

  useEffect(() => {
    setFocus('email')
  }, [setFocus])

  const usernameValue = watch('username') ?? ''
  const usernameLooksValid = USERNAME_PATTERN.test(usernameValue)

  const onSubmit = async (values: SignupValues) => {
    setGenericError(null)
    try {
      await authApi.signup({
        email: values.email,
        password: values.password,
        username: values.username,
      })
      setSubmittedEmail(values.email)
    } catch (error) {
      const apiError = getApiError(error)
      const messages = apiError?.details?.errors
      if (apiError && Array.isArray(messages) && messages.length > 0) {
        const buckets = distributeErrors(messages)
        if (buckets.email) setError('email', { message: buckets.email })
        if (buckets.username)
          setError('username', { message: buckets.username })
        if (buckets.password)
          setError('password', { message: buckets.password })
        if (buckets.generic) setGenericError(buckets.generic)
        if (!buckets.email && !buckets.username && !buckets.password) {
          setGenericError(
            buckets.generic ?? 'Revisá los datos e intentá otra vez.',
          )
        }
      } else {
        setGenericError('Algo salió mal. Probá de nuevo en un momento.')
      }
    }
  }

  if (submittedEmail) {
    return <ConfirmationPending email={submittedEmail} />
  }

  const emailError = errors.email?.message
  const usernameError = errors.username?.message
  const passwordError = errors.password?.message
  const confirmError = errors.passwordConfirm?.message

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Crear cuenta"
    >
      {genericError && (
        <div
          role="alert"
          className="bg-danger-soft mb-4 rounded-[10px] border border-[#FCA5A5] px-3.5 py-3 text-[12.5px] leading-relaxed text-[#991B1B]"
        >
          {genericError}
        </div>
      )}

      <div className="mb-3.5">
        <Label htmlFor="signup-email" className="text-text-primary mb-1.5">
          Email
        </Label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="vos@ejemplo.com"
          aria-invalid={Boolean(emailError) || undefined}
          aria-describedby={emailError ? 'signup-email-error' : undefined}
          {...register('email')}
        />
        {emailError && (
          <FieldError id="signup-email-error">{emailError}</FieldError>
        )}
      </div>

      <div className="mb-3.5">
        <Label htmlFor="signup-username" className="text-text-primary mb-1.5">
          Nombre de usuario
        </Label>
        <div className="relative">
          <Input
            id="signup-username"
            autoComplete="username"
            placeholder="tu_usuario"
            className="pr-10"
            aria-invalid={Boolean(usernameError) || undefined}
            aria-describedby={
              usernameError ? 'signup-username-error' : 'signup-username-hint'
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
          <FieldError id="signup-username-error">{usernameError}</FieldError>
        ) : (
          <p
            id="signup-username-hint"
            className="text-text-secondary mt-1.5 text-[11.5px] leading-snug"
          >
            {usernameValue.length === 0
              ? 'Entre 3 y 20 caracteres: minúsculas, números o guion bajo.'
              : usernameLooksValid
                ? 'Se ve bien.'
                : 'Usá solo minúsculas, números o guion bajo (3 a 20).'}
          </p>
        )}
      </div>

      <div className="mb-3.5">
        <Label htmlFor="signup-password" className="text-text-primary mb-1.5">
          Contraseña
        </Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            className="pr-10"
            aria-invalid={Boolean(passwordError) || undefined}
            aria-describedby={
              passwordError
                ? `${passwordHintId} ${passwordErrorId}`
                : passwordHintId
            }
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
        {/* Requirements stay visible as proactive help text (not an error), so
            the user knows the rules before submitting. Mirrors the backend:
            8–128 chars + at least one digit (no uppercase/symbols). The breach
            check is reactive and surfaces as an error only if it trips. */}
        <p
          id={passwordHintId}
          className="text-text-secondary mt-1.5 text-[11.5px] leading-snug"
        >
          Mínimo 8 caracteres, con al menos un número.
        </p>
        {passwordError && (
          <FieldError id={passwordErrorId}>{passwordError}</FieldError>
        )}
      </div>

      <div className="mb-4">
        <Label
          htmlFor="signup-password-confirm"
          className="text-text-primary mb-1.5"
        >
          Repetí la contraseña
        </Label>
        <Input
          id="signup-password-confirm"
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
        {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
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

function ConfirmationPending({ email }: { email: string }) {
  return (
    <div className="text-center" role="status">
      <div className="bg-brand-primary-soft text-brand-primary mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full">
        <MailCheck size={24} strokeWidth={2} aria-hidden="true" />
      </div>
      <h2 className="font-display text-text-primary text-xl font-bold tracking-tight">
        Revisá tu correo
      </h2>
      <p className="text-text-secondary mx-auto mt-2 max-w-[320px] text-sm leading-relaxed">
        Te enviamos un enlace de confirmación a{' '}
        <span className="text-text-primary font-semibold">{email}</span>.
        Confirmá tu cuenta y después iniciá sesión.
      </p>
      <Button asChild variant="outline" size="lg" className="mt-5 w-full">
        <Link to="/login">Ir a iniciar sesión</Link>
      </Button>
    </div>
  )
}
