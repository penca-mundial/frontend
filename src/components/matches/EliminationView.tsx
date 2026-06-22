import { KnockoutBracket } from '@/components/matches/KnockoutBracket'
import { Skeleton } from '@/components/ui/skeleton'
import { toKnockoutBracket } from '@/features/matches/bracketAdapter'
import { useBracket } from '@/features/matches/hooks/useBracket'
import { useTournament } from '@/features/tournament-predictions/hooks/useTournament'
import { formatKickoff } from '@/lib/date'
import { detectUserTimezone } from '@/lib/timezone'

/**
 * The knockout view: the read-only, data-driven `KnockoutBracket` (its own
 * endpoint). Knockout matches are listed and predicted from the Calendario tab,
 * so the Eliminación tab is the cuadro only — no list / toggle here. Self-fetches
 * via the current tournament; only mounted on the Eliminación tab.
 */
export function EliminationView() {
  const tournamentQuery = useTournament()
  const timezone = detectUserTimezone()

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

  const { rounds, thirdPlace } = toKnockoutBracket(data)

  // Create-on-resolve: no knockout rounds yet → nothing to draw.
  if (rounds.length === 0) {
    return (
      <p className="text-text-secondary text-body-sm py-8 text-center">
        Las eliminatorias se publican cuando se confirmen los cruces.
      </p>
    )
  }

  return (
    <KnockoutBracket
      rounds={rounds}
      thirdPlace={thirdPlace}
      formatDate={(iso) => formatKickoff(iso, 'date', timezone)}
    />
  )
}
