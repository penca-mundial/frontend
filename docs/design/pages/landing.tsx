// app/(public)/page.tsx  (Next.js App Router)
// — o el equivalente en tu router. Es una página estática 100% — server-renderable.
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Target, Trophy, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/button";
import { Logo } from "@/components/header";
import { PublicFooter } from "@/components/footer";

/**
 * Landing — pantalla pública para visitantes anónimos.
 * Si el visitante está autenticado, el middleware/route-guard debería redirigir
 * a /app/home antes de que esto se renderice (PublicOnlyRoute).
 */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <PublicHeader />
      <Hero />
      <HowItWorks />
      <RulesBlock />
      <RepeatCTA />
      <PublicFooter />
    </div>
  );
}

/* ------------------------------------------------------------------------- */

function PublicHeader() {
  return (
    <header className="sticky top-0 z-10 bg-bg/85 backdrop-blur border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 md:px-10">
        <Link href="/" aria-label="Penca Mundial — inicio">
          <Logo />
        </Link>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Ingresar</Link>
          </Button>
          <Button variant="primary" size="sm" asChild>
            <Link href="/signup">Crear cuenta</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------------- */

function Hero() {
  return (
    <section
      className="relative overflow-hidden px-5 pt-8 pb-6 md:px-10 md:py-16"
      // background tint sutil verde cancha
      style={{
        backgroundImage: "linear-gradient(180deg, rgba(15,118,110,0) 0%, rgba(15,118,110,0.04) 100%)",
      }}
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-14">
        <div>
          <div className="font-semibold uppercase tracking-[0.12em] text-[11px] text-brand-primary">
            ⚽ Pronósticos del Mundial 2026
          </div>
          <h1 className="mt-3 font-display text-[clamp(34px,8vw,68px)] font-bold leading-[0.95] tracking-[-0.025em] max-w-2xl">
            Tu penca del Mundial,
            <br />
            <span className="font-normal italic font-serif">sin Excel</span> ni grupos
            <br />
            de WhatsApp.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-text-secondary md:text-[17px]">
            Pronosticá los partidos, sumá puntos con tus amigos, llevate la gloria.
            Gratis y para todo el Mundial 2026.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button variant="primary" size="lg" iconRight={ArrowRight} asChild>
              <Link href="/signup">Crear cuenta gratis</Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/login">Ya tengo cuenta</Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-text-disabled">
            No pedimos tarjeta. Te tomamos un email y ya.
          </p>
        </div>

        <HeroMockup />
      </div>
    </section>
  );
}

function HeroMockup() {
  // Placeholder. En producción mostrá una imagen real del dashboard o un
  // <MatchCard> + chips renderizados directamente.
  return (
    <div className="relative rounded-3xl border border-border bg-[linear-gradient(180deg,var(--surface)_0%,var(--surface-muted)_100%)] p-4">
      <div className="font-semibold uppercase tracking-[0.12em] text-[11px] text-text-secondary mb-2.5">
        En vivo · Mirá cómo se ve
      </div>
      <Image
        src="/marketing/hero-mockup.png"
        alt="Captura del dashboard de Penca Mundial mostrando un partido en vivo y el pronóstico del usuario"
        width={520} height={420}
        className="rounded-xl"
        priority
      />
    </div>
  );
}

/* ------------------------------------------------------------------------- */

function HowItWorks() {
  const steps = [
    { icon: Target, title: "Predecí",     body: "Antes de cada partido tirás tu pronóstico: cuántos goles cada equipo, y en fases finales quién pasa." },
    { icon: Trophy, title: "Sumá puntos", body: "Acertar el exacto da más que solo el ganador. Las fases finales multiplican el puntaje." },
    { icon: Users,  title: "Compará",     body: "Creás una penca con tu grupo, compartís un código, y compiten contra todos los jugadores." },
  ];
  return (
    <section id="como-funciona" className="bg-surface px-5 py-10 md:px-10 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="font-semibold uppercase tracking-[0.12em] text-[11px] text-text-secondary">
          Cómo funciona
        </div>
        <h2 className="mt-2 mb-6 font-display text-[clamp(26px,5vw,40px)] font-bold leading-[1.0] tracking-tight">
          Tres pasos.
          <br />
          <span className="font-normal italic font-serif">No más.</span>
        </h2>

        <div className="grid gap-3.5 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="flex flex-col gap-2.5 rounded-2xl bg-surface-muted p-5">
              <div className="flex items-center justify-between">
                <span className="inline-flex size-9 items-center justify-center rounded-[10px] border border-border bg-surface">
                  <s.icon size={18} aria-hidden="true" />
                </span>
                <span className="font-mono text-[11px] text-text-disabled">
                  0{i + 1}
                </span>
              </div>
              <h3 className="font-display text-xl font-bold leading-tight">{s.title}</h3>
              <p className="text-[13.5px] leading-relaxed text-text-secondary">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------- */

function RulesBlock() {
  const rows: [string, string, string | number][] = [
    ["Resultado exacto",  "3–1 → 3–1",         10],
    ["Misma diferencia",  "2–0 → 3–1",          6],
    ["Solo el ganador",   "ganaste/perdiste",   3],
    ["Pasa de ronda",     "octavos y siguientes", "+5"],
  ];
  return (
    <section id="reglas" className="bg-bg px-5 py-10 md:px-10 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="font-semibold uppercase tracking-[0.12em] text-[11px] text-text-secondary">
          Reglas
        </div>
        <h2 className="mt-2 mb-6 font-display text-[clamp(26px,5vw,40px)] font-bold leading-[1.0] tracking-tight">
          Cómo se reparten los puntos.
        </h2>

        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          {rows.map((row, i) => (
            <div
              key={row[0]}
              className={`grid grid-cols-[1.4fr_1fr_56px] items-center gap-2.5 px-4 py-3.5 ${i < rows.length - 1 ? "border-b border-border" : ""}`}
            >
              <span className="text-sm font-semibold">{row[0]}</span>
              <span className="font-mono text-xs text-text-secondary">{row[1]}</span>
              <span className="text-right font-display text-[22px] font-bold text-brand-primary">
                {row[2]}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-3 text-[12.5px] leading-relaxed text-text-secondary">
          Octavos, cuartos, semis y final multiplican el puntaje (×2, ×2.5, ×3, ×4).
          Y al inicio elegís campeón, subcampeón, tercero, cuarto y goleador: cada uno también suma.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------- */

function RepeatCTA() {
  return (
    <section
      className="relative overflow-hidden border-t border-border bg-brand-primary px-5 py-12 text-white md:px-10 md:py-20"
    >
      {/* Stripes decoration */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0 32px, rgba(255,255,255,0.4) 32px 33px)",
        }}
      />
      <div className="relative mx-auto max-w-7xl">
        <h2 className="font-display text-[clamp(28px,6vw,52px)] font-bold leading-[1.0] tracking-tight">
          Llevá la cuenta
          <br />
          de tus aciertos.
        </h2>
        <p className="mt-3 text-sm text-white/80">
          Una sola cuenta. Todas tus pencas.
        </p>
        <div className="mt-5">
          <Button variant="white" size="lg" iconRight={ArrowRight} asChild>
            <Link href="/signup">Crear cuenta gratis</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
