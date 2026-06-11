import { Link } from 'react-router-dom'
import { ArrowRight, Trophy } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardCard } from '@/features/home/components/DashboardCard'
import { useMyRanking } from '@/features/home/hooks/useMyRanking'
import { formatThousands } from '@/lib/format'

/**
 * "Tu ranking" in the mock's compact layout: a trophy at the top-right, the
 * global position large with "de M" small inline, then "X puntos" bottom-left
 * and a "Ver ranking →" link bottom-right. Shows a placeholder until the user
 * has a ranked row (e.g. before any match is scored, or until Rankings data
 * lands).
 */
export function RankingCard() {
  const { position, points, total, isLoading } = useMyRanking()

  return (
    <DashboardCard
      title="Tu ranking"
      headerRight={<Trophy aria-hidden="true" className="text-brand-accent size-5" />}
    >
      {isLoading ? (
        <Skeleton className="h-12 w-full rounded-lg" />
      ) : position != null ? (
        <div className="flex flex-col gap-3">
          <p className="flex items-baseline gap-1.5">
            <span className="font-display text-display-lg leading-none font-bold">
              {position}º
            </span>
            {total != null && (
              <span className="text-text-secondary text-body-sm">
                de {formatThousands(total)}
              </span>
            )}
          </p>
          <div className="flex items-end justify-between gap-3">
            <span className="text-text-secondary text-body-sm">
              {points != null && (
                <>
                  <span className="text-text-primary font-display font-semibold tabular-nums">
                    {formatThousands(points)}
                  </span>{' '}
                  puntos
                </>
              )}
            </span>
            <Link
              to="/app/rankings"
              className="text-brand-primary focus-visible:ring-ring inline-flex items-center gap-1 rounded-sm text-body-sm font-medium focus-visible:ring-2 focus-visible:outline-none"
            >
              Ver ranking
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-text-secondary text-body-sm">
          Todavía no tenés posición en el ranking.
        </p>
      )}
    </DashboardCard>
  )
}
