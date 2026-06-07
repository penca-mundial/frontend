import { Navigate } from 'react-router-dom'
import { ChooseUsernameForm } from '@/features/auth/components/ChooseUsernameForm'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

/**
 * Hard gate after Google sign-in: the user must pick a username before entering
 * the app. Anyone who already has one is bounced to /app/home. There is no skip.
 */
export function ChooseUsernamePage() {
  const { currentUser } = useCurrentUser()

  // ProtectedRoute already guarantees a session; if they aren't missing a
  // username, there's nothing to do here.
  if (currentUser && !currentUser.needsUsername) {
    return <Navigate to="/app/home" replace />
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="border-border bg-surface flex h-[60px] items-center justify-center border-b px-5">
        <span className="font-display text-brand-primary text-lg font-extrabold tracking-tight">
          Magic Penca
        </span>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 pt-8 pb-10">
        <div className="w-full max-w-[420px]">
          <div className="border-border bg-surface rounded-2xl border p-7 shadow-sm">
            <div className="mb-5">
              <h1 className="font-display text-text-primary text-2xl font-bold tracking-tight">
                Elegí tu nombre de usuario
              </h1>
              <p className="text-text-secondary mt-1.5 text-sm leading-relaxed">
                Un último paso antes de empezar: con qué nombre querés jugar.
              </p>
            </div>

            <ChooseUsernameForm />
          </div>
        </div>
      </main>

      <footer className="text-text-disabled px-5 py-4 text-center font-mono text-[11px]">
        © {new Date().getFullYear()} Magic Penca
      </footer>
    </div>
  )
}
