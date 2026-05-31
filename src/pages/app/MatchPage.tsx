import { Link, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { LiveScoreboard } from '@/features/matches/components/LiveScoreboard'
import { MatchHeader } from '@/features/matches/components/MatchHeader'
import { PredictionForm } from '@/features/matches/components/PredictionForm'
import { PredictionLock } from '@/features/matches/components/PredictionLock'
import { useMatch } from '@/features/matches/hooks/useMatch'
import { isMatchLocked } from '@/features/matches/utils'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { detectUserTimezone } from '@/lib/timezone'

/**
 * Match detail: header, a live scoreboard while in play, and either the
 * prediction form (open) or the read-only locked view (locked/finished). The
 * underlying query polls every 12s while the match is live.
 */
export function MatchPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { currentUser } = useCurrentUser()
  const timezone = currentUser?.timezone ?? detectUserTimezone()

  const { data: match, isLoading, isError } = useMatch(id)

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <Link
        to="/app/matches"
        className="text-text-secondary hover:text-text-primary inline-flex w-fit items-center gap-1 text-body-sm"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        Volver a partidos
      </Link>

      {isLoading ? (
        <div className="flex flex-col gap-4" aria-busy="true">
          <Skeleton className="mx-auto h-28 w-full max-w-md rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      ) : isError || !match ? (
        <p className="text-danger text-body">
          No pudimos cargar el partido. Intentá de nuevo.
        </p>
      ) : (
        <>
          <MatchHeader match={match} timezone={timezone} />
          {match.status === 'live' && <LiveScoreboard match={match} />}
          {isMatchLocked(match) ? (
            <PredictionLock match={match} />
          ) : (
            <PredictionForm match={match} />
          )}
        </>
      )}
    </div>
  )
}
