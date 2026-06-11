import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SectionLabel } from '@/components/ui/section-label'
import { SoccerBall } from '@/components/icons/SoccerBall'
import { DashboardCard } from '@/features/home/components/DashboardCard'
import { TeamFlag } from '@/features/tournament-predictions/components/TeamFlag'
import { useTournament } from '@/features/tournament-predictions/hooks/useTournament'
import { useTeams } from '@/features/tournament-predictions/hooks/useTeams'
import { usePlayers } from '@/features/tournament-predictions/hooks/usePlayers'
import { useTournamentPrediction } from '@/features/tournament-predictions/hooks/useTournamentPrediction'
import type { MatchTeam } from '@/features/matches/types'
import type {
  Player,
  TournamentPrediction,
} from '@/features/tournament-predictions/types'
import { cn } from '@/lib/cn'

const TOURNAMENT_PREDICTION_PATH = '/app/predictions/tournament'

type PodiumSpot = 'championId' | 'runnerUpId' | 'thirdPlaceId' | 'fourthPlaceId'

interface RowConfig {
  /** Podium rank 1–4, or 'scorer' for the top-scorer row. */
  rank: 1 | 2 | 3 | 4 | 'scorer'
  /** Secondary role label shown on the right (Campeón / Goleador / …). */
  role: string
  spot: PodiumSpot | 'topScorer'
}

/** The five rows of the mock, in order: full podium then the top scorer. */
const ROWS: RowConfig[] = [
  { rank: 1, role: 'Campeón', spot: 'championId' },
  { rank: 2, role: 'Subcampeón', spot: 'runnerUpId' },
  { rank: 3, role: 'Tercer puesto', spot: 'thirdPlaceId' },
  { rank: 4, role: 'Cuarto puesto', spot: 'fourthPlaceId' },
  { rank: 'scorer', role: 'Goleador', spot: 'topScorer' },
]

/** Per-rank medallion tint (gold / silver / bronze / neutral / scorer-teal). */
const MEDAL_TINT: Record<RowConfig['rank'], string> = {
  1: 'bg-brand-accent-soft text-[#92400e]',
  2: 'bg-surface-sunken text-text-secondary',
  3: 'bg-[#FBE8D3] text-[#9A5B27]',
  4: 'bg-surface-muted text-text-secondary',
  scorer: 'bg-brand-primary-soft text-brand-primary-hover',
}

/** A small medallion: the position number, or a boot icon for the scorer. */
function RankMedallion({ rank }: { rank: RowConfig['rank'] }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'font-display inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
        MEDAL_TINT[rank],
      )}
    >
      {rank === 'scorer' ? <SoccerBall className="size-3.5" /> : rank}
    </span>
  )
}

interface ResolvedRow {
  rank: RowConfig['rank']
  role: string
  flagUrl: string | null
  name: string
}

/** Resolve a row's pick to a flag + name, '—' when unset. */
function resolveRow(
  row: RowConfig,
  prediction: TournamentPrediction,
  teams: MatchTeam[],
  players: Player[],
): ResolvedRow {
  if (row.spot === 'topScorer') {
    const player = prediction.topScorerId
      ? (players.find((p) => p.id === prediction.topScorerId) ?? null)
      : null
    return {
      rank: row.rank,
      role: row.role,
      flagUrl: player?.team?.flagUrl ?? null,
      name: player?.name ?? '—',
    }
  }
  const teamId = prediction[row.spot]
  const team = teamId ? (teams.find((t) => t.id === teamId) ?? null) : null
  return {
    rank: row.rank,
    role: row.role,
    flagUrl: team?.flagUrl ?? null,
    name: team?.name ?? '—',
  }
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
        <dl className="divide-border divide-y">
          {ROWS.map((row) => {
            const { rank, role, flagUrl, name } = resolveRow(
              row,
              prediction,
              teamsQuery.data ?? [],
              playersQuery.data ?? [],
            )
            return (
              <div
                key={row.spot}
                className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <dd className="text-body-sm flex min-w-0 items-center gap-2.5 font-semibold">
                  <RankMedallion rank={rank} />
                  <TeamFlag flagUrl={flagUrl} />
                  <span className="truncate">{name}</span>
                </dd>
                <SectionLabel as="dt" tone="secondary" size="sm" className="shrink-0">
                  {role}
                </SectionLabel>
              </div>
            )
          })}
        </dl>
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
