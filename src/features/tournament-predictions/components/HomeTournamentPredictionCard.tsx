import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  COMPACT_SUMMARY_SPOTS,
  TournamentPredictionSummary,
} from '@/features/tournament-predictions/components/TournamentPredictionSummary'
import { useTournament } from '@/features/tournament-predictions/hooks/useTournament'
import { useTeams } from '@/features/tournament-predictions/hooks/useTeams'
import { usePlayers } from '@/features/tournament-predictions/hooks/usePlayers'
import { useTournamentPrediction } from '@/features/tournament-predictions/hooks/useTournamentPrediction'

const TOURNAMENT_PREDICTION_PATH = '/app/predictions/tournament'

/** The link affordance; stretched (`after:absolute inset-0`) so the whole card
 *  is clickable while keeping a single accessible link with a clear name. */
function CardLink({ children }: { children: string }) {
  return (
    <Link
      to={TOURNAMENT_PREDICTION_PATH}
      className="text-brand-primary focus-visible:ring-ring ml-auto inline-flex items-center gap-1 rounded-sm text-body-sm font-medium transition-colors after:absolute after:inset-0 focus-visible:ring-2 focus-visible:outline-none"
    >
      {children}
      <ArrowRight aria-hidden="true" className="size-4" />
    </Link>
  )
}

/**
 * Home dashboard card for the tournament-wide prediction (podium + top scorer).
 * Shows a compact summary (champion + runner-up + scorer) once a prediction
 * exists — with a "Bloqueado" badge when locked — a CTA when empty, and a
 * skeleton while loading. The whole card links to the full prediction page;
 * it does not add a navbar item.
 */
export function HomeTournamentPredictionCard() {
  const tournamentQuery = useTournament()
  const tournamentId = tournamentQuery.data?.id
  const teamsQuery = useTeams(tournamentId)
  const playersQuery = usePlayers(tournamentId)
  const { query: predictionQuery } = useTournamentPrediction()

  const loading =
    tournamentQuery.isLoading ||
    predictionQuery.isLoading ||
    teamsQuery.isLoading ||
    playersQuery.isLoading

  const prediction = predictionQuery.data ?? null
  const locked = Boolean(tournamentQuery.data?.isLocked || prediction?.locked)

  return (
    <section
      aria-labelledby="home-tournament-prediction-title"
      className="border-border bg-surface relative flex flex-col gap-4 rounded-xl border p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="home-tournament-prediction-title"
          className="font-display text-body font-semibold"
        >
          Pronóstico del torneo
        </h2>
        {locked && <Badge variant="secondary">Bloqueado</Badge>}
      </div>

      {loading ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      ) : prediction ? (
        <>
          <TournamentPredictionSummary
            prediction={prediction}
            teams={teamsQuery.data ?? []}
            players={playersQuery.data ?? []}
            spots={COMPACT_SUMMARY_SPOTS}
            className="border-0 bg-transparent"
          />
          <CardLink>Ver/editar</CardLink>
        </>
      ) : (
        <>
          <p className="text-text-secondary text-body-sm">
            Todavía no armaste tu pronóstico del Mundial 2026.
          </p>
          <CardLink>Armá el tuyo</CardLink>
        </>
      )}
    </section>
  )
}
