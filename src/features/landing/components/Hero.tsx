import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Landing hero: headline, sub-copy and the primary/secondary CTAs. */
export function Hero() {
  return (
    <section className="px-5 pt-10 pb-8 md:px-10 md:pt-16 md:pb-14">
      <div className="mx-auto max-w-3xl text-center md:text-left">
        <p className="text-brand-primary text-[11px] font-semibold tracking-[0.12em] uppercase">
          Pronósticos del Mundial 2026
        </p>
        <h1 className="font-display mt-3 text-[clamp(34px,8vw,60px)] font-bold leading-[0.98] tracking-tight">
          Tu penca del Mundial,{' '}
          <span className="font-serif font-normal italic">sin Excel</span> ni
          grupos de WhatsApp.
        </h1>
        <p className="text-text-secondary text-body-lg mx-auto mt-4 max-w-xl md:mx-0">
          Pronosticá los partidos, sumá puntos con tus amigos y llevate la
          gloria. Gratis y para todo el Mundial 2026.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3 md:justify-start">
          <Button size="lg" asChild>
            <Link to="/signup">
              Crear cuenta gratis
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button variant="link" asChild>
            <Link to="/login">Ya tengo cuenta</Link>
          </Button>
        </div>
        <p className="text-text-disabled text-body-sm mt-3">
          No pedimos tarjeta. Te tomamos un email y ya.
        </p>
      </div>
    </section>
  )
}
