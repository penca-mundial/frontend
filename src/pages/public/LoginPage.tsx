import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { Button } from '@/components/ui/button'

/**
 * Visual placeholder for the Google sign-in entry point. The real
 * `GoogleSignInButton` (with the OAuth redirect) lands in SCRUM-117; until then
 * this keeps the layout honest without wiring an unverified OAuth flow.
 */
function GoogleSignInButtonPlaceholder() {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="border-border-strong w-full gap-2.5"
      disabled
      aria-label="Continuar con Google (próximamente)"
    >
      <GoogleIcon />
      Continuar con Google
    </Button>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.7-6.2 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3c-2 1.5-4.5 2.4-7.4 2.4-5.1 0-9.5-3.3-11.2-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.3 5.3c-.4.4 6.6-4.8 6.6-15 0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  )
}

/** Maps an OAuth `?error=` redirect code to user-facing copy. */
const OAUTH_ERROR_COPY: Record<string, string> = {
  use_password:
    'Esta cuenta usa email y contraseña. Ingresá con tu contraseña.',
  oauth_failed: 'No pudimos iniciar sesión con Google. Probá con tu email.',
  oauth_failure: 'No pudimos iniciar sesión con Google. Probá con tu email.',
  system_account: 'El email o la contraseña no coinciden.',
}

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const resetSuccess = searchParams.get('reset') === 'success'
  const oauthErrorCopy = OAUTH_ERROR_COPY[searchParams.get('error') ?? '']

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="border-border bg-surface flex h-[60px] items-center justify-center border-b px-5">
        <Link
          to="/"
          aria-label="Penca Mundial — inicio"
          className="font-display text-brand-primary text-lg font-extrabold tracking-tight"
        >
          Penca Mundial
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 pt-8 pb-10">
        <div className="w-full max-w-[420px]">
          <div className="border-border bg-surface rounded-2xl border p-7 shadow-sm">
            <div className="mb-5">
              <h1 className="font-display text-text-primary text-2xl font-bold tracking-tight">
                Bienvenido de vuelta
              </h1>
              <p className="text-text-secondary mt-1.5 text-sm leading-relaxed">
                Ingresá con tu email o con Google.
              </p>
            </div>

            {resetSuccess && (
              <div
                role="status"
                className="bg-success-soft mb-4 flex items-start gap-2.5 rounded-[10px] border border-[#A7F3D0] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[#065F46]"
              >
                <CheckCircle2
                  size={15}
                  strokeWidth={2}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  Tu contraseña se actualizó. Ya podés iniciar sesión.
                </span>
              </div>
            )}

            {oauthErrorCopy && (
              <div
                role="alert"
                className="bg-danger-soft mb-4 rounded-[10px] border border-[#FCA5A5] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[#991B1B]"
              >
                {oauthErrorCopy}
              </div>
            )}

            <GoogleSignInButtonPlaceholder />

            <div className="text-text-disabled my-4 flex items-center gap-3">
              <span className="bg-border h-px flex-1" />
              <span className="font-mono text-[11px] whitespace-nowrap">
                o con email
              </span>
              <span className="bg-border h-px flex-1" />
            </div>

            <LoginForm />

            <div className="border-border text-text-secondary mt-5 border-t pt-4 text-center text-[13px]">
              ¿Todavía no tenés cuenta?{' '}
              <Link
                to="/signup"
                className="text-brand-primary font-semibold hover:underline"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-text-disabled px-5 py-4 text-center font-mono text-[11px]">
        © {new Date().getFullYear()} Penca Mundial
      </footer>
    </div>
  )
}
