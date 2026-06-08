import { Skeleton } from '@/components/ui/skeleton'
import { ScoringTables } from '@/features/scoring/components/ScoringTables'
import { useScoringConfig } from '@/features/scoring/hooks/useScoringConfig'

/**
 * Landing scoring section. Consumes the same `GET /scoring_rules` config as the
 * in-app rules page (SCRUM-296) through the shared `ScoringTables` — one source
 * of truth, no hardcoded points. The section chrome (eyebrow + heading + note)
 * stays here. On error the tables are simply omitted: the landing is marketing,
 * not a critical flow, so it degrades quietly rather than showing an alert.
 */
export function ScoringRulesTable() {
  const { data: config, isLoading, isError } = useScoringConfig()

  return (
    <section className="px-5 py-12 md:px-10 md:py-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-text-secondary text-[11px] font-semibold tracking-[0.12em] uppercase">
          Reglas
        </p>
        <h2 className="font-display mt-2 mb-7 text-[clamp(26px,5vw,38px)] font-bold leading-tight tracking-tight">
          Cómo se reparten los puntos.
        </h2>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2" aria-busy="true">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-44 w-full rounded-2xl" />
            ))}
          </div>
        ) : isError || !config ? null : (
          <ScoringTables config={config} />
        )}

        <p className="text-text-secondary text-body-sm mt-4 leading-relaxed">
          El puntaje de cada partido se multiplica según la fase. Además, al
          arranque elegís campeón, subcampeón, tercero, cuarto y goleador: cada
          acierto también suma.
        </p>
      </div>
    </section>
  )
}
