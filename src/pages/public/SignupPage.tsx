import { Link, useSearchParams } from 'react-router-dom'
import { SignupForm } from '@/features/auth/components/SignupForm'
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton'
import { RETURN_TO_PARAM, readReturnTo } from '@/features/auth/returnTo'

export function SignupPage() {
  const [searchParams] = useSearchParams()
  const returnTo = readReturnTo(`?${searchParams.toString()}`)
  const loginHref = returnTo
    ? `/login?${RETURN_TO_PARAM}=${encodeURIComponent(returnTo)}`
    : '/login'

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
                Crear cuenta
              </h1>
              <p className="text-text-secondary mt-1.5 text-sm leading-relaxed">
                Sumate y armá tu penca para el Mundial 2026.
              </p>
            </div>

            <GoogleSignInButton label="Registrarte con Google" />

            <div className="text-text-disabled my-4 flex items-center gap-3">
              <span className="bg-border h-px flex-1" />
              <span className="font-mono text-[11px] whitespace-nowrap">
                o con email
              </span>
              <span className="bg-border h-px flex-1" />
            </div>

            <SignupForm />

            <div className="border-border text-text-secondary mt-5 border-t pt-4 text-center text-[13px]">
              ¿Ya tenés cuenta?{' '}
              <Link
                to={loginHref}
                className="text-brand-primary font-semibold hover:underline"
              >
                Iniciar sesión
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
