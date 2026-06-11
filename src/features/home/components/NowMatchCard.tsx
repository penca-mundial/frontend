import { MatchCardExpandable } from '@/components/matches/MatchCardExpandable'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardCard } from '@/features/home/components/DashboardCard'
import { useNowMatch } from '@/features/home/hooks/useNowMatch'

/**
 * "Ahora mismo": the in-play match if there is one, otherwise the next
 * scheduled fixture. Reuses `MatchCardExpandable` so the user can predict the
 * upcoming match inline; the prediction rides the match payload
 * (`my_prediction`). Live scores refresh via the hook's poll. Degrades to an
 * empty note when nothing is live or upcoming.
 */
export function NowMatchCard() {
  const { match, isLive, isLoading } = useNowMatch()

  return (
    <DashboardCard title={isLive ? 'Ahora mismo' : 'Próximo partido'}>
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
