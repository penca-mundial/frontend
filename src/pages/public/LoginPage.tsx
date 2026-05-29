import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton'

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

            <GoogleSignInButton />

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
