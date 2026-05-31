import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LiveScoreboard } from '@/features/matches/components/LiveScoreboard'
import { MatchHeader } from '@/features/matches/components/MatchHeader'
import { PredictionLock } from '@/features/matches/components/PredictionLock'
import {
  PredictionEditor,
  type PredictionInput,
} from '@/components/matches/PredictionEditor'
import { getApiError } from '@/api/auth.api'
import { useMatch } from '@/features/matches/hooks/useMatch'
import { useUpsertPrediction } from '@/features/matches/hooks/useUpsertPrediction'
import { isMatchLocked } from '@/features/matches/utils'
import { detectUserTimezone } from '@/lib/timezone'
import { toast } from '@/hooks/useToast'

/**
 * Match detail (deep-link fallback — the primary prediction path is inline from
 * the fixture list). Shows the header, a live scoreboard while in play, and
 * either the shared prediction editor (open) or the read-only locked view
 * (locked/finished). The query polls every 12s while the match is live.
 */
export function MatchPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  // Always render kickoff times in the viewer's own (browser) timezone, so the
  // app is correct for anyone outside UTC regardless of any stored preference.
  const timezone = detectUserTimezone()

  const { data: match, isLoading, isError } = useMatch(id)
  const upsert = useUpsertPrediction(id)

  const handleSave = async (input: PredictionInput) => {
    try {
      await upsert.mutateAsync({
        match_id: id,
        predicted_home_score: input.home,
        predicted_away_score: input.away,
        predicted_advancing_team_id: input.advancing,
      })
      toast({ title: '¡Pronóstico guardado!' })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo guardar el pronóstico',
        description: getApiError(error)?.message ?? 'Intentá de nuevo.',
      })
      // Swallow: the editor stays mounted so the user can retry.
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
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
            <Card className="p-4">
              <PredictionEditor
                match={match}
                initial={match.myPrediction}
                onSave={handleSave}
                onCancel={() => navigate('/app/matches')}
                variant="inline"
              />
            </Card>
          )}
        </>
      )}
    </div>
  )
}
