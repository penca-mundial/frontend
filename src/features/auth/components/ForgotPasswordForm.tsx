import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { AlertCircle, MailCheck } from 'lucide-react'
import { authApi } from '@/api/auth.api'
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from '@/features/auth/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  })

  useEffect(() => {
    setFocus('email')
  }, [setFocus])

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      await authApi.requestPasswordReset({ email: values.email })
    } catch {
      // Swallow: never reveal whether the email exists, not even via failures.
    } finally {
      // The endpoint always 202s; show the same neutral message no matter what.
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="text-center" role="status">
        <div className="bg-brand-primary-soft text-brand-primary mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full">
          <MailCheck size={24} strokeWidth={2} aria-hidden="true" />
        </div>
        <h2 className="font-display text-text-primary text-xl font-bold tracking-tight">
          Revisá tu correo
        </h2>
        <p className="text-text-secondary mx-auto mt-2 max-w-[320px] text-sm leading-relaxed">
          Si el email está registrado, vas a recibir un enlace para restablecer
          tu contraseña en unos minutos.
        </p>
        <Button asChild variant="outline" size="lg" className="mt-5 w-full">
          <Link to="/login">Volver a iniciar sesión</Link>
        </Button>
      </div>
    )
  }

  const emailError = errors.email?.message

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Recuperar contraseña"
    >
      <div className="mb-4">
        <Label htmlFor="forgot-email" className="text-text-primary mb-1.5">
          Email
        </Label>
        <Input
          id="forgot-email"
          type="email"
          autoComplete="email"
          placeholder="vos@ejemplo.com"
          aria-invalid={Boolean(emailError) || undefined}
          aria-describedby={emailError ? 'forgot-email-error' : undefined}
          {...register('email')}
        />
        {emailError && (
          <p
            id="forgot-email-error"
            role="alert"
            className="text-danger mt-1.5 inline-flex items-center gap-1.5 text-[11.5px] leading-snug"
          >
            <AlertCircle size={12} strokeWidth={2} aria-hidden="true" />
            {emailError}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Enviando…' : 'Enviar enlace de recuperación'}
      </Button>
    </form>
  )
}
