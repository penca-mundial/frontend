import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { AlertCircle, CheckCircle2, MailCheck } from 'lucide-react'
import { authApi } from '@/api/auth.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const resendSchema = z.object({
  email: z
    .string()
    .min(1, 'Ingresá tu email.')
    .email('Esto no parece un email válido.'),
})
type ResendValues = z.infer<typeof resendSchema>

/**
 * Landing page for the confirmation email link. The backend confirms the token
 * server-side and redirects here with `?status=success|invalid|expired`, so the
 * page only reflects that status — it doesn't re-confirm the token.
 */
export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams()
  const status = searchParams.get('status')

  return (
    <Shell>
      {status === 'success' ? (
        <SuccessState />
      ) : (
        <NeedsResendState status={status} />
      )}
    </Shell>
  )
}

function SuccessState() {
  return (
    <div className="text-center" role="status">
      <div className="bg-success-soft text-success mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full">
        <CheckCircle2 size={24} strokeWidth={2} aria-hidden="true" />
      </div>
      <h1 className="font-display text-text-primary text-2xl font-bold tracking-tight">
        ¡Email confirmado!
      </h1>
      <p className="text-text-secondary mx-auto mt-2 max-w-[320px] text-sm leading-relaxed">
        Tu cuenta ya está activa. Iniciá sesión para empezar a armar tu penca.
      </p>
      <Button asChild size="lg" className="mt-5 w-full">
        <Link to="/login">Iniciar sesión</Link>
      </Button>
    </div>
  )
}

function NeedsResendState({ status }: { status: string | null }) {
  const isExpired = status === 'expired'
  const isInvalid = status === 'invalid'
  const title = isExpired
    ? 'El enlace expiró'
    : isInvalid
      ? 'El enlace no es válido'
      : 'Confirmá tu email'
  const description = isExpired
    ? 'El enlace de confirmación venció. Pedí uno nuevo y revisá tu correo.'
    : isInvalid
      ? 'No pudimos confirmar tu cuenta con ese enlace. Pedí uno nuevo y volvé a intentar.'
      : 'Revisá tu correo y hacé clic en el enlace que te enviamos. ¿No te llegó? Pedí otro acá.'

  return (
    <div>
      <div className="mb-5 text-center">
        <div className="bg-warning-soft mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full text-[#854D0E]">
          <AlertCircle size={24} strokeWidth={2} aria-hidden="true" />
        </div>
        <h1 className="font-display text-text-primary text-2xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="text-text-secondary mx-auto mt-2 max-w-[320px] text-sm leading-relaxed">
          {description}
        </p>
      </div>
      <ResendConfirmationForm />
      <div className="border-border text-text-secondary mt-5 border-t pt-4 text-center text-[13px]">
        ¿Ya confirmaste?{' '}
        <Link
          to="/login"
          className="text-brand-primary font-semibold hover:underline"
        >
          Iniciar sesión
        </Link>
      </div>
    </div>
  )
}

function ResendConfirmationForm() {
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResendValues>({
    resolver: zodResolver(resendSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (values: ResendValues) => {
    try {
      await authApi.resendConfirmation({ email: values.email })
    } catch {
      // Swallow: the endpoint always 202s and never reveals if the email exists.
    } finally {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div
        role="status"
        className="bg-success-soft flex items-start gap-2.5 rounded-[10px] border border-[#A7F3D0] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[#065F46]"
      >
        <MailCheck
          size={15}
          strokeWidth={2}
          className="mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <span>
          Si el email está registrado y sin confirmar, te enviamos un nuevo
          enlace. Revisá tu correo.
        </span>
      </div>
    )
  }

  const emailError = errors.email?.message

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Reenviar confirmación"
    >
      <div className="mb-4">
        <Label htmlFor="confirm-email" className="text-text-primary mb-1.5">
          Email
        </Label>
        <Input
          id="confirm-email"
          type="email"
          autoComplete="email"
          placeholder="vos@ejemplo.com"
          aria-invalid={Boolean(emailError) || undefined}
          aria-describedby={emailError ? 'confirm-email-error' : undefined}
          {...register('email')}
        />
        {emailError && (
          <p
            id="confirm-email-error"
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
        {isSubmitting ? 'Enviando…' : 'Reenviar email de confirmación'}
      </Button>
    </form>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="border-border bg-surface flex h-[60px] items-center justify-center border-b px-5">
        <Link
          to="/"
          aria-label="Magic Penca — inicio"
          className="font-display text-brand-primary text-lg font-extrabold tracking-tight"
        >
          Magic Penca
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 pt-8 pb-10">
        <div className="w-full max-w-[420px]">
          <div className="border-border bg-surface rounded-2xl border p-7 shadow-sm">
            {children}
          </div>
        </div>
      </main>

      <footer className="text-text-disabled px-5 py-4 text-center font-mono text-[11px]">
        © {new Date().getFullYear()} Magic Penca
      </footer>
    </div>
  )
}
