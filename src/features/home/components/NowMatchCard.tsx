import { MatchCardExpandable } from '@/components/matches/MatchCardExpandable'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardCard } from '@/features/home/components/DashboardCard'
import { LiveMatchCard } from '@/features/home/components/LiveMatchCard'
import { useNowMatch } from '@/features/home/hooks/useNowMatch'

/**
 * "Ahora mismo": the in-play matches if there are any, otherwise the next
 * scheduled fixture. Live matches each render a dedicated `LiveMatchCard` (mock
 * layout, read-only), stacked vertically so concurrent fixtures all show. The
 * upcoming state reuses `MatchCardExpandable` so the user can predict it inline.
 * Live scores refresh via the hook's poll. Degrades to an empty note when
 * nothing is live or upcoming.
 */
export function NowMatchCard() {
  const { liveMatches, nextMatch, isLoading } = useNowMatch()

  if (liveMatches.length > 0) {
    return (
      <div className="flex flex-col gap-6">
        {liveMatches.map((match) => (
          <LiveMatchCard key={match.id} match={match} />
        ))}
      </div>
    )
  }

  return (
    <DashboardCard title="Próximo partido">
      {isLoading ? (
        <Skeleton className="h-28 w-full rounded-xl" />
      ) : nextMatch ? (
        <MatchCardExpandable
          match={nextMatch}
          prediction={nextMatch.myPrediction ?? null}
        />
      ) : (
        <p className="text-text-secondary text-body-sm">
          No hay partidos en juego ni próximos por ahora.
        </p>
      )}
    </DashboardCard>
  )
}
