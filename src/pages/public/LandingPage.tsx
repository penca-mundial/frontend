import { Footer } from '@/components/layout/Footer'
import { PublicHeader } from '@/components/layout/PublicHeader'
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
      <PublicHeader />

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
