import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/layout/Header'

/**
 * Styled catch-all 404. Reachable both logged-in and out, so it carries its
 * own minimal brand header (no app nav, no public CTAs) and routes back to
 * `/`, which lands on the landing or the app home depending on the session.
 */
export function NotFoundPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="border-border bg-surface flex h-[60px] items-center justify-center border-b px-5">
        <Link to="/" aria-label="Magic Penca — inicio">
          <Logo />
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p
          aria-hidden="true"
          className="font-display text-brand-primary text-7xl font-extrabold tracking-tight"
        >
          404
        </p>
        <h1 className="font-display text-text-primary mt-4 text-2xl font-bold tracking-tight">
          Página no encontrada
        </h1>
        <p className="text-text-secondary mx-auto mt-2 max-w-[360px] text-sm leading-relaxed">
          La página que buscás no existe o se movió de lugar.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link to="/">Volver al inicio</Link>
        </Button>
      </main>
    </div>
  )
}
