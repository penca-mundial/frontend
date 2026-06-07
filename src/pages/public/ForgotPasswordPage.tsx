import { Link } from 'react-router-dom'
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'

export function ForgotPasswordPage() {
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
            <div className="mb-5">
              <h1 className="font-display text-text-primary text-2xl font-bold tracking-tight">
                Recuperar contraseña
              </h1>
              <p className="text-text-secondary mt-1.5 text-sm leading-relaxed">
                Ingresá tu email y te mandamos un enlace para crear una nueva.
              </p>
            </div>

            <ForgotPasswordForm />

            <div className="border-border text-text-secondary mt-5 border-t pt-4 text-center text-[13px]">
              ¿Te acordaste?{' '}
              <Link
                to="/login"
                className="text-brand-primary font-semibold hover:underline"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-text-disabled px-5 py-4 text-center font-mono text-[11px]">
        © {new Date().getFullYear()} Magic Penca
      </footer>
    </div>
  )
}
