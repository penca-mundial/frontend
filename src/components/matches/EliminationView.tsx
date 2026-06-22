import { KnockoutBracket } from '@/components/matches/KnockoutBracket'
import { Skeleton } from '@/components/ui/skeleton'
import { ProjectedStandingsNote } from '@/features/matches/components/ProjectedStandingsNote'
import {
  projectedToKnockoutBracket,
  toKnockoutBracket,
} from '@/features/matches/bracketAdapter'
import { useBracket } from '@/features/matches/hooks/useBracket'
import { useProjectedBracket } from '@/features/matches/hooks/useProjectedBracket'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useTournament } from '@/features/tournament-predictions/hooks/useTournament'
import { formatKickoff } from '@/lib/date'
import { detectUserTimezone } from '@/lib/timezone'

function BracketSkeleton() {
  return (
    <div className="flex gap-6" aria-busy="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-72 w-44 rounded-lg" />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <p className="text-text-secondary text-body-sm py-8 text-center">
      Las eliminatorias se publican cuando se confirmen los cruces.
    </p>
  )
}

/**
 * The knockout view (read-only, data-driven). Source switches on the backend
 * `projected` flag — no manual toggle:
 *   - signed-in & still projected → the viewer's projected Round-of-32 ("según
 *     tus pronósticos", blended with real results) + the explanatory note;
 *   - signed-in & confirmed (projected:false), or anonymous → the official
 *     `/bracket` tree.
 * The official query stays disabled until needed, so projected:true is a single
 * fetch; projected:false is two dependent fetches; anonymous is one.
 */
export function EliminationView() {
  const { currentUser } = useCurrentUser()
  const isAuthed = currentUser !== null
  const tournamentQuery = useTournament()
  const tournamentId = tournamentQuery.data?.id
  const timezone = detectUserTimezone()
  // Projected slots carry no kickoff (`''`) — render no date for them.
  const formatDate = (iso: string) =>
    iso ? formatKickoff(iso, 'date', timezone) : ''

  const projectedQuery = useProjectedBracket(tournamentId, { enabled: isAuthed })
  const showProjected =
    isAuthed && !projectedQuery.isError && projectedQuery.data?.projected === true

  // Fall back to the official bracket for anonymous viewers, once projected is
  // confirmed false, or if the projected fetch failed.
  const officialQuery = useBracket(tournamentId, {
    enabled:
      !isAuthed ||
      projectedQuery.isError ||
      projectedQuery.data?.projected === false,
  })

  if (tournamentQuery.isLoading) return <BracketSkeleton />
  // Still deciding the source for a signed-in viewer.
  if (isAuthed && projectedQuery.isLoading) return <BracketSkeleton />

  if (showProjected && projectedQuery.data) {
    const { rounds, thirdPlace } = projectedToKnockoutBracket(
      projectedQuery.data.roundOf32,
    )
    if (rounds[0].matches.length === 0) return <EmptyState />
    return (
      <div className="flex flex-col gap-3">
        <ProjectedStandingsNote />
        <KnockoutBracket
          rounds={rounds}
          thirdPlace={thirdPlace}
          formatDate={formatDate}
        />
      </div>
    )
  }

  if (officialQuery.isLoading) return <BracketSkeleton />
  if (officialQuery.isError || !officialQuery.data) {
    return (
      <p className="text-danger text-body">
        No pudimos cargar el cuadro. Intentá de nuevo.
      </p>
    )
  }

  const { rounds, thirdPlace } = toKnockoutBracket(officialQuery.data)
  if (rounds.length === 0) return <EmptyState />

  return (
    <KnockoutBracket
      rounds={rounds}
      thirdPlace={thirdPlace}
      formatDate={formatDate}
    />
  )
}
