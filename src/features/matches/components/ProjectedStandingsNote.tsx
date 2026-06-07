import { Sparkles } from 'lucide-react'

/**
 * One-line note above the projected group tables (SCRUM-294): positions and
 * points blend official results with the user's predictions, so a team can
 * show points before playing — this makes that hybrid explicit.
 */
export function ProjectedStandingsNote() {
  return (
    <p className="border-brand-primary/15 bg-brand-primary-soft text-brand-primary-hover flex items-start gap-2 rounded-lg border px-3 py-2 text-body-sm">
      <Sparkles size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>
        <strong className="font-semibold">Según tus pronósticos</strong> — las
        posiciones y puntos combinan los resultados oficiales con tus
        predicciones de los partidos que faltan jugar.
      </span>
    </p>
  )
}
