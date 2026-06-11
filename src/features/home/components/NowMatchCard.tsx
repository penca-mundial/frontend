import { MatchCardExpandable } from '@/components/matches/MatchCardExpandable'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardCard } from '@/features/home/components/DashboardCard'
import { LiveMatchCard } from '@/features/home/components/LiveMatchCard'
import { useNowMatch } from '@/features/home/hooks/useNowMatch'

/**
 * "Ahora mismo": the in-play match if there is one, otherwise the next
 * scheduled fixture. The live state renders the dedicated `LiveMatchCard` (mock
 * layout, read-only); the upcoming state reuses `MatchCardExpandable` so the
 * user can predict it inline. Live scores refresh via the hook's poll. Degrades
 * to an empty note when nothing is live or upcoming.
 */
export function NowMatchCard() {
  const { match, isLive, isLoading } = useNowMatch()

  if (isLive && match) {
    return <LiveMatchCard match={match} />
  }

  return (
    <DashboardCard title="Próximo partido">
      {isLoading ? (
        <Skeleton className="h-28 w-full rounded-xl" />
      ) : match ? (
        <MatchCardExpandable match={match} prediction={match.myPrediction ?? null} />
      ) : (
        <p className="text-text-secondary text-body-sm">
          No hay partidos en juego ni próximos por ahora.
        </p>
      )}
    </DashboardCard>
  )
}
