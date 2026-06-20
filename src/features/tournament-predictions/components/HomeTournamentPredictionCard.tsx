import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardCard } from '@/features/home/components/DashboardCard'
import {
  PODIUM_ROLES,
  TournamentPodium,
  type PodiumRow,
} from '@/features/tournament-predictions/components/TournamentPodium'
import { useTournament } from '@/features/tournament-predictions/hooks/useTournament'
import { useTeams } from '@/features/tournament-predictions/hooks/useTeams'
import { usePlayers } from '@/features/tournament-predictions/hooks/usePlayers'
import { useTournamentPrediction } from '@/features/tournament-predictions/hooks/useTournamentPrediction'
import type { MatchTeam } from '@/features/matches/types'
import type {
  Player,
  TournamentPrediction,
} from '@/features/tournament-predictions/types'

const TOURNAMENT_PREDICTION_PATH = '/app/predictions/tournament'

/** The podium team ids, in `PODIUM_ROLES` order (champion → fourth place). */
const PODIUM_TEAM_SPOTS = [
  'championId',
  'runnerUpId',
  'thirdPlaceId',
  'fourthPlaceId',
] as const

/** Resolve the prediction's ids against the team/player lists into podium rows. */
function resolveRows(
  prediction: TournamentPrediction,
  teams: MatchTeam[],
  players: Player[],
): PodiumRow[] {
  return PODIUM_ROLES.map(({ rank, role }, index) => {
    if (rank === 'scorer') {
      const player = prediction.topScorerId
        ? (players.find((p) => p.id === prediction.topScorerId) ?? null)
        : null
      return {
        rank,
        role,
        flagUrl: player?.team?.flagUrl ?? null,
        name: player?.name ?? '—',
      }
    }
    const teamId = prediction[PODIUM_TEAM_SPOTS[index]]
    const team = teamId ? (teams.find((t) => t.id === teamId) ?? null) : null
    return { rank, role, flagUrl: team?.flagUrl ?? null, name: team?.name ?? '—' }
  })
}

/**
 * Home dashboard card for the tournament-wide prediction, in the mock's layout:
 * each row is [medallion · flag · name] on the left with the role (Campeón,
 * Subcampeón, … Goleador) as secondary text on the right, plus a "Bloqueado"
 * badge when locked. Shows the full podium + scorer once a prediction exists, a
 * CTA when empty, and a skeleton while loading. The whole card links to the
 * full prediction page. (The shared `TournamentPredictionSummary` keeps its
 * own label-left layout for the prediction page — this is a separate consumer.)
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
    <DashboardCard
      title="Pronóstico del torneo"
      headerRight={locked ? <Badge variant="secondary">Bloqueado</Badge> : null}
      action={
        prediction && !locked
          ? { to: TOURNAMENT_PREDICTION_PATH, label: 'Ver/editar' }
          : undefined
      }
    >
      {loading ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ) : prediction ? (
        <TournamentPodium
          rows={resolveRows(
            prediction,
            teamsQuery.data ?? [],
            playersQuery.data ?? [],
          )}
        />
      ) : (
        <>
          <p className="text-text-secondary text-body-sm">
            Todavía no armaste tu pronóstico del Mundial 2026.
          </p>
          <Link
            to={TOURNAMENT_PREDICTION_PATH}
            className="text-brand-primary focus-visible:ring-ring inline-flex items-center gap-1 self-start rounded-sm text-body-sm font-medium focus-visible:ring-2 focus-visible:outline-none"
          >
            Armá el tuyo
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </>
      )}
    </DashboardCard>
  )
}
