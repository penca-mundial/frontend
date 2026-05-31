import { useMemo, useState, type ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { MatchList } from '@/features/matches/components/MatchList'
import { usePredictions } from '@/features/predictions/hooks/usePredictions'
import { useMatches } from '@/features/matches/hooks/useMatches'
import type { Match } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'
import { predictionResultStatus } from '@/features/predictions/utils'
import { detectUserTimezone } from '@/lib/timezone'
import { cn } from '@/lib/cn'

type StatusFilter = 'all' | 'upcoming' | 'live' | 'finished' | 'hits'

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'upcoming', label: 'Próximos' },
  { value: 'live', label: 'En vivo' },
  { value: 'finished', label: 'Terminados' },
  { value: 'hits', label: 'Aciertos' },
]

/** A prediction joined with the match it belongs to. */
interface Row {
  prediction: Prediction
  match: Match
}

/** Whether the prediction earned points (exact score or right outcome). */
function isHit(row: Row): boolean {
  const status = predictionResultStatus(row.prediction, row.match)
  return status === 'exact' || status === 'partial'
}

function Stat({
  value,
  label,
  sub,
  valueClass,
}: {
  value: ReactNode
  label: string
  sub?: string
  valueClass?: string
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span
        className={cn(
          'font-display text-2xl font-bold tabular-nums',
          valueClass ?? 'text-text-primary',
        )}
      >
        {value}
      </span>
      <span className="text-text-primary text-body-sm font-semibold">{label}</span>
      {sub && <span className="text-text-secondary text-body-sm">{sub}</span>}
    </div>
  )
}

/**
 * History of the current user's predictions with their results. Predictions
 * (`GET /predictions/me`) are joined client-side with the matches list (the
 * predictions endpoint returns no match data), summarised in a stats card,
 * filtered by match status, and rendered as the same day-grouped cards as the
 * fixture — read-only here, since the prediction is already made.
 */
export function MyPredictionsPage() {
  const timezone = detectUserTimezone()
  const [filter, setFilter] = useState<StatusFilter>('all')

  const { data: predData, isLoading, isError } = usePredictions(1, 100)
  const { data: matchData } = useMatches({})

  const matchMap = useMemo(
    () => new Map((matchData?.matches ?? []).map((m) => [m.id, m])),
    [matchData],
  )
  const totalMatches = matchData?.totalCount ?? matchMap.size

  // Only predictions whose match we've loaded — needed to know status/result.
  const rows = useMemo<Row[]>(
    () =>
      (predData?.predictions ?? [])
        .map((prediction) => ({
          prediction,
          match: matchMap.get(prediction.matchId),
        }))
        .filter((row): row is Row => row.match !== undefined),
    [predData, matchMap],
  )

  const stats = useMemo(() => {
    let exact = 0
    let partial = 0
    for (const row of rows) {
      const status = predictionResultStatus(row.prediction, row.match)
      if (status === 'exact') exact += 1
      else if (status === 'partial') partial += 1
    }
    return { predicted: rows.length, exact, partial }
  }, [rows])

  const filtered = useMemo(() => {
    switch (filter) {
      case 'upcoming':
        return rows.filter((row) => row.match.status === 'scheduled')
      case 'live':
        return rows.filter((row) => row.match.status === 'live')
      case 'finished':
        return rows.filter((row) => row.match.status === 'finished')
      case 'hits':
        return rows.filter(isHit)
      default:
        return rows
    }
  }, [rows, filter])

  const matches = useMemo(() => filtered.map((row) => row.match), [filtered])
  const predictionsByMatch = useMemo(() => {
    const map = new Map<string, Prediction>()
    for (const row of filtered) map.set(row.match.id, row.prediction)
    return map
  }, [filtered])

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-display-lg font-display font-semibold">
          Mis pronósticos
        </h1>
        <p className="text-text-secondary text-body-sm">
          Tu historial de aciertos.
        </p>
      </div>

      <div className="border-border bg-surface grid grid-cols-4 gap-2 rounded-xl border p-4">
        <Stat value={stats.predicted} label="Pronosticados" sub={`de ${totalMatches}`} />
        <Stat value={stats.exact} label="Exactos" valueClass="text-success" />
        <Stat value={stats.partial} label="Parciales" valueClass="text-warning" />
        {/* Points stay "—" until SCRUM-258 exposes points_earned in the API. */}
        <Stat value="—" label="Puntos" />
      </div>

      <div
        role="group"
        aria-label="Filtrar por estado"
        className="bg-surface-muted inline-flex w-fit max-w-full gap-1 overflow-x-auto rounded-lg p-1"
      >
        {FILTERS.map(({ value, label }) => {
          const selected = filter === value
          return (
            <button
              key={value}
              type="button"
              aria-pressed={selected}
              onClick={() => setFilter(value)}
              className={cn(
                'shrink-0 rounded-md px-3.5 py-1.5 text-body-sm font-medium whitespace-nowrap transition-colors',
                selected
                  ? 'bg-surface text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary',
              )}
            >
              {label}
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
      ) : rows.length === 0 ? (
        <p className="text-text-secondary text-body">
          Todavía no hiciste pronósticos.
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-text-secondary text-body">
          No hay pronósticos para este filtro.
        </p>
      ) : (
        <MatchList
          matches={matches}
          predictions={predictionsByMatch}
          timezone={timezone}
          readOnly
        />
      )}
    </div>
  )
}
