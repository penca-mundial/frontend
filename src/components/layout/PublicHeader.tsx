import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/layout/Header'

/**
 * Sticky public header for anonymous-only pages (Landing, Terms, Privacy,
 * etc.). Logo on the left + Ingresar/Crear cuenta CTAs on the right. Reuses
 * the existing Logo and Button primitives. Authenticated routes use the
 * app Header from layout/, not this one.
 */
export function PublicHeader() {
  return (
    <header className="border-border bg-surface/85 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-10">
        <Link to="/" aria-label="Magic Penca — inicio">
          <Logo />
        </Link>
        <nav className="flex items-center gap-2" aria-label="Acceso">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Ingresar</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/signup">Crear cuenta</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
