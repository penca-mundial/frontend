import { Skeleton } from '@/components/ui/skeleton'
import { DashboardCard } from '@/features/home/components/DashboardCard'
import { useMyRanking } from '@/features/home/hooks/useMyRanking'
import { formatThousands } from '@/lib/format'

/**
 * "Tu ranking": the user's global position and points, linking to the full
 * leaderboard. Shows a placeholder until they have a ranked row (e.g. before
 * any match is scored, or until Rankings data lands).
 */
export function RankingCard() {
  const { position, points, total, isLoading } = useMyRanking()

  return (
    <DashboardCard title="Tu ranking" action={{ to: '/app/rankings', label: 'Ver ranking' }}>
      {isLoading ? (
        <Skeleton className="h-12 w-full rounded-lg" />
      ) : position != null ? (
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col">
            <span className="font-display text-display-md leading-none font-bold">
              {position}º
            </span>
            {total != null && (
              <span className="text-text-secondary text-body-sm mt-1">
                de {formatThousands(total)} jugadores
              </span>
            )}
          </div>
          {points != null && (
            <span className="text-text-secondary text-body-sm">
              <span className="text-text-primary font-display font-semibold tabular-nums">
                {formatThousands(points)}
              </span>{' '}
              puntos
            </span>
          )}
        </div>
      ) : (
        <p className="text-text-secondary text-body-sm">
          Todavía no tenés posición en el ranking.
        </p>
      )}
    </DashboardCard>
  )
}
