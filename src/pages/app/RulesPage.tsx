import { Skeleton } from '@/components/ui/skeleton'
import { ScoringTables } from '@/features/scoring/components/ScoringTables'
import { useScoringConfig } from '@/features/scoring/hooks/useScoringConfig'

/**
 * In-app rules page (`/app/rules`, SCRUM-296). Renders the full scoring
 * configuration from `GET /scoring_rules` — per-match points, the
 * tournament-wide specials and the per-phase multipliers — via the shared
 * `ScoringTables` (the same component the public landing uses). Reached from
 * the user dropdown. Loading and error states are handled here so the tables
 * stay purely presentational.
 */
export function RulesPage() {
  const { data: config, isLoading, isError } = useScoringConfig()

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-display-lg font-display font-semibold">Reglas</h1>
        <p className="text-text-secondary text-body">
          Así se reparten los puntos en cada pronóstico.
        </p>
      </header>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : isError || !config ? (
        <p className="text-danger text-body">
          No pudimos cargar las reglas. Intentá de nuevo.
        </p>
      ) : (
        <>
          <ScoringTables config={config} />
          <p className="text-text-secondary text-body-sm leading-relaxed">
            El puntaje de cada partido se multiplica según la fase. Además, al
            arranque elegís campeón, subcampeón, tercero, cuarto y goleador:
            cada acierto también suma.
          </p>
        </>
      )}
    </div>
  )
}
