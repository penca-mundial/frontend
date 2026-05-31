import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/features/landing/components/Hero'
import { HowItWorks } from '@/features/landing/components/HowItWorks'
import { ScoringRulesTable } from '@/features/landing/components/ScoringRulesTable'
import { LandingFooterCTA } from '@/features/landing/components/LandingFooterCTA'

/**
 * Public marketing landing for anonymous visitors. Fully static. The route
 * wraps it in `<PublicOnlyRoute>`, which redirects authenticated users to
 * /app/home, so this only ever renders for logged-out visitors — hence the
 * dedicated public header (login/signup) rather than the app `Header`.
 */
export function LandingPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="border-border bg-surface/85 sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-10">
          <Link to="/" aria-label="Penca Mundial — inicio">
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

      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <ScoringRulesTable />
        <LandingFooterCTA />
      </main>

      <Footer />
    </div>
  )
}
