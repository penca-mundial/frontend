import { Target, Trophy, UserPlus, type LucideIcon } from 'lucide-react'

interface Step {
  icon: LucideIcon
  title: string
  body: string
}

const STEPS: Step[] = [
  {
    icon: UserPlus,
    title: 'Sumate gratis',
    body: 'Creá tu cuenta en segundos. No pedimos tarjeta — solo un email y ya estás adentro.',
  },
  {
    icon: Target,
    title: 'Hacé tus pronósticos',
    body: 'Antes de cada partido cargás tu resultado. En las finales también elegís quién pasa de ronda.',
  },
  {
    icon: Trophy,
    title: 'Competí y ganá',
    body: 'Sumás puntos por cada acierto y competís con tus amigos en tu propia penca.',
  },
]

/** "Cómo funciona": the three steps to get playing. */
export function HowItWorks() {
  return (
    <section className="bg-surface px-5 py-12 md:px-10 md:py-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-text-secondary text-[11px] font-semibold tracking-[0.12em] uppercase">
          Cómo funciona
        </p>
        <h2 className="font-display mt-2 mb-7 text-[clamp(26px,5vw,38px)] font-bold leading-tight tracking-tight">
          Tres pasos, nada más.
        </h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="bg-surface-muted flex flex-col gap-2.5 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between">
                <span className="border-border bg-surface inline-flex size-9 items-center justify-center rounded-[10px] border">
                  <step.icon size={18} aria-hidden="true" />
                </span>
                <span className="text-text-disabled font-mono text-[11px]">
                  0{index + 1}
                </span>
              </div>
              <h3 className="font-display text-body-lg font-bold leading-tight">
                {step.title}
              </h3>
              <p className="text-text-secondary text-body-sm leading-relaxed">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
