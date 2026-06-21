import { BracketView } from '@/components/matches/BracketView'
import { Skeleton } from '@/components/ui/skeleton'
import { useBracket } from '@/features/matches/hooks/useBracket'
import { useTournament } from '@/features/tournament-predictions/hooks/useTournament'

/**
 * The knockout view: the read-only, data-driven `BracketView` (its own
 * endpoint). Knockout matches are listed and predicted from the Calendario tab,
 * so the Eliminación tab is the cuadro only — no list / toggle here. Self-fetches
 * via the current tournament; only mounted on the Eliminación tab.
 */
export function EliminationView() {
  const tournamentQuery = useTournament()
  const { data, isLoading, isError } = useBracket(tournamentQuery.data?.id)

  if (isLoading || tournamentQuery.isLoading) {
    return (
      <div className="flex gap-6" aria-busy="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-72 w-44 rounded-lg" />
        ))}
      </div>
    )
  }

  if (isError || !data) {
    return (
      <p className="text-danger text-body">
        No pudimos cargar el cuadro. Intentá de nuevo.
      </p>
    )
  }

  return <BracketView matches={data} />
}
