import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { takeReturnTo } from '@/features/auth/returnTo'
import { Button } from '@/components/ui/button'

const ERROR_COPY: Record<string, string> = {
  use_password:
    'Esta cuenta ya existe con email y contraseña. Ingresá con tu contraseña en lugar de Google.',
  system_account: 'No pudimos iniciar sesión con esa cuenta.',
}

/**
 * Landing page for the Google OAuth redirect. On success the backend has
 * already set the session cookie and bounced here; we refetch the session and
 * route to onboarding (if the user still needs a username) or the app. If the
 * backend bounced back an `?error=` (e.g. the email belongs to a password
 * account), we surface it instead of redirecting.
 */
export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { currentUser, isLoading, refetch } = useCurrentUser()

  const errorParam = searchParams.get('error')

  // Re-read the session once on mount; the cookie was just set by the backend.
  useEffect(() => {
    if (!errorParam) refetch()
  }, [errorParam, refetch])

  useEffect(() => {
    if (errorParam || isLoading) return
    if (currentUser) {
      if (currentUser.needsUsername) {
        // Keep the stashed returnTo for after onboarding completes.
        navigate('/onboarding/username', { replace: true })
      } else {
        navigate(takeReturnTo() ?? '/app/home', { replace: true })
      }
    } else {
      // No session resolved — treat as a failed sign-in.
      navigate('/login?error=oauth_failed', { replace: true })
    }
  }, [errorParam, isLoading, currentUser, navigate])

  if (errorParam) {
    return (
      <Shell>
        <div className="text-center" role="alert">
          <div className="bg-danger-soft text-danger mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full">
            <AlertCircle size={24} strokeWidth={2} aria-hidden="true" />
          </div>
          <h1 className="font-display text-text-primary text-2xl font-bold tracking-tight">
            No pudimos continuar con Google
          </h1>
          <p className="text-text-secondary mx-auto mt-2 max-w-[320px] text-sm leading-relaxed">
            {ERROR_COPY[errorParam] ??
              'Algo salió mal con el inicio de sesión de Google. Probá de nuevo.'}
          </p>
          <Button asChild size="lg" className="mt-5 w-full">
            <Link to="/login">Volver a iniciar sesión</Link>
          </Button>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div
        className="flex flex-col items-center py-6"
        role="status"
        aria-live="polite"
      >
        <div
          className="border-surface-sunken border-t-brand-primary size-8 animate-spin rounded-full border-2"
          aria-hidden="true"
        />
        <p className="text-text-secondary mt-4 text-sm">
          Estamos iniciando tu sesión…
        </p>
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
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
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
