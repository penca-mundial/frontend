import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Secondary CTA band before the footer. */
export function LandingFooterCTA() {
  return (
    <section className="bg-brand-primary relative overflow-hidden px-5 py-14 text-white md:px-10 md:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, transparent 0 32px, rgba(255,255,255,0.4) 32px 33px)',
        }}
      />
      <div className="relative mx-auto max-w-5xl text-center md:text-left">
        <h2 className="font-display text-[clamp(26px,6vw,44px)] font-bold leading-tight tracking-tight">
          Sumate ahora — el Mundial empieza el 11 de junio.
        </h2>
        <div className="mt-6 flex justify-center md:justify-start">
          <Button
            size="lg"
            asChild
            className="text-brand-primary bg-white hover:bg-white/90"
          >
            <Link to="/signup">
              Crear cuenta gratis
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
