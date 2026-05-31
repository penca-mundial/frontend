import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  MyPredictionsList,
  type PredictionRow,
} from '@/features/predictions/components/MyPredictionsList'
import { usePredictions } from '@/features/predictions/hooks/usePredictions'
import { useMatches } from '@/features/matches/hooks/useMatches'
import type { MatchPhase } from '@/features/matches/types'
import {
  KNOCKOUT_ROUND_ORDER,
  PHASE_LABELS,
} from '@/features/matches/utils'
import { cn } from '@/lib/cn'

const PAGE_SIZE = 10
const PHASE_ORDER: MatchPhase[] = ['group_stage', ...KNOCKOUT_ROUND_ORDER]
type PhaseFilter = MatchPhase | 'all'

/**
 * History of the current user's predictions with their results. Predictions
 * (`GET /predictions/me`) are joined client-side with the matches list (the
 * predictions endpoint returns no match data), filtered by phase and paginated.
 */
export function MyPredictionsPage() {
  const [phase, setPhase] = useState<PhaseFilter>('all')
  const [page, setPage] = useState(1)

  const { data: predData, isLoading, isError } = usePredictions(1, 100)
  const { data: matchData } = useMatches({})

  const matchMap = useMemo(
    () => new Map((matchData?.matches ?? []).map((m) => [m.id, m])),
    [matchData],
  )

  const allRows: PredictionRow[] = useMemo(
    () =>
      (predData?.predictions ?? []).map((prediction) => ({
        prediction,
        match: matchMap.get(prediction.matchId),
      })),
    [predData, matchMap],
  )

  const presentPhases = useMemo(() => {
    const present = new Set(
      allRows.map((row) => row.match?.phase).filter(Boolean) as MatchPhase[],
    )
    return PHASE_ORDER.filter((p) => present.has(p))
  }, [allRows])

  const filtered =
    phase === 'all'
      ? allRows
      : allRows.filter((row) => row.match?.phase === phase)

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageRows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  const changePhase = (next: PhaseFilter) => {
    setPhase(next)
    setPage(1)
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-display-lg font-display font-semibold">
          Mis pronósticos
        </h1>
        <p className="text-text-secondary text-body-sm">
          Tu historial de aciertos.
        </p>
      </div>

      <div
        role="group"
        aria-label="Filtrar por fase"
        className="flex flex-wrap gap-2"
      >
        {(['all', ...presentPhases] as PhaseFilter[]).map((value) => {
          const selected = phase === value
          return (
            <button
              key={value}
              type="button"
              aria-pressed={selected}
              onClick={() => changePhase(value)}
              className={cn(
                'rounded-full border px-3 py-1 text-body-sm font-medium transition-colors',
                selected
                  ? 'border-brand-primary bg-brand-primary text-white'
                  : 'border-border text-text-secondary hover:bg-surface-muted',
              )}
            >
              {value === 'all' ? 'Todas' : PHASE_LABELS[value]}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-danger text-body">
          No pudimos cargar tus pronósticos. Intentá de nuevo.
        </p>
      ) : allRows.length === 0 ? (
        <p className="text-text-secondary text-body">
          Todavía no hiciste pronósticos.
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-text-secondary text-body">
          No hay pronósticos para esta fase.
        </p>
      ) : (
        <>
          <MyPredictionsList rows={pageRows} />
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <span className="text-text-secondary text-body-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
