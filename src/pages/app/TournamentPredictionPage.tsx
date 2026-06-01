import { Skeleton } from '@/components/ui/skeleton'
import { SectionLabel } from '@/components/ui/section-label'
import { TournamentPredictionForm } from '@/features/tournament-predictions/components/TournamentPredictionForm'
import { TeamFlag } from '@/features/tournament-predictions/components/TeamFlag'
import { useTournament } from '@/features/tournament-predictions/hooks/useTournament'
import { useTeams } from '@/features/tournament-predictions/hooks/useTeams'
import { usePlayers } from '@/features/tournament-predictions/hooks/usePlayers'
import { useTournamentPrediction } from '@/features/tournament-predictions/hooks/useTournamentPrediction'
import { useCountdown } from '@/features/tournament-predictions/hooks/useCountdown'
import type { MatchTeam } from '@/features/matches/types'
import type {
  Player,
  TournamentPrediction,
} from '@/features/tournament-predictions/types'

/** "1d 3h 12m 05s" — days/hours shown only when non-zero. */
function formatCountdown(total: number): string {
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (days > 0 || hours > 0) parts.push(`${hours}h`)
  parts.push(`${pad(minutes)}m`, `${pad(seconds)}s`)
  return parts.join(' ')
}

type PodiumKey =
  | 'championId'
  | 'runnerUpId'
  | 'thirdPlaceId'
  | 'fourthPlaceId'

const PODIUM: { id: PodiumKey; label: string }[] = [
  { id: 'championId', label: 'Campeón' },
  { id: 'runnerUpId', label: 'Subcampeón' },
  { id: 'thirdPlaceId', label: 'Tercer puesto' },
  { id: 'fourthPlaceId', label: 'Cuarto puesto' },
]

/** Read-only summary of the user's own prediction once the tournament locks. */
function LockedView({
  prediction,
  teams,
  players,
}: {
  prediction: TournamentPrediction | null
  teams: MatchTeam[]
  players: Player[]
}) {
  if (!prediction) {
    return (
      <p className="text-text-secondary text-body">
        No hiciste tu pronóstico del torneo antes del cierre.
      </p>
    )
  }
  const findTeam = (id: string | null) =>
    id ? (teams.find((team) => team.id === id) ?? null) : null
  const scorer = prediction.topScorerId
    ? (players.find((player) => player.id === prediction.topScorerId) ?? null)
    : null

  return (
    <dl className="border-border bg-surface divide-border divide-y rounded-xl border">
      {PODIUM.map(({ id, label }) => {
        const team = findTeam(prediction[id])
        return (
          <div
            key={id}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <SectionLabel as="dt" tone="secondary">
              {label}
            </SectionLabel>
            <dd className="flex items-center gap-2 text-body-sm font-semibold">
              <TeamFlag flagUrl={team?.flagUrl ?? null} />
              {team?.name ?? '—'}
            </dd>
          </div>
        )
      })}
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <SectionLabel as="dt" tone="secondary">
          Goleador
        </SectionLabel>
        <dd className="flex items-center gap-2 text-body-sm font-semibold">
          <TeamFlag flagUrl={scorer?.team?.flagUrl ?? null} />
          {scorer?.name ?? '—'}
        </dd>
      </div>
    </dl>
  )
}

/**
 * Tournament-wide prediction: podium (champion → 4th) + top scorer for the
 * current tournament. Editable until kickoff; a live countdown sits above the
 * form and, at zero, refetches the tournament to confirm the lock. Once locked,
 * the page shows the user's prediction read-only instead of the form.
 */
export function TournamentPredictionPage() {
  const tournamentQuery = useTournament()
  const tournament = tournamentQuery.data
  const tournamentId = tournament?.id

  const teamsQuery = useTeams(tournamentId)
  const playersQuery = usePlayers(tournamentId)
  const { query: predictionQuery, upsert } = useTournamentPrediction()

  const remaining = useCountdown(tournament?.secondsUntilKickoff ?? 0, () => {
    void tournamentQuery.refetch()
  })

  const locked = Boolean(tournament?.isLocked || predictionQuery.data?.locked)
  const dataReady =
    teamsQuery.data !== undefined &&
    playersQuery.data !== undefined &&
    !predictionQuery.isLoading

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-display-lg font-display font-semibold">
          Pronóstico del torneo
        </h1>
        <p className="text-text-secondary text-body-sm">
          Elegí el podio y el goleador del Mundial 2026.
        </p>
      </div>

      {tournamentQuery.isLoading ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      ) : tournamentQuery.isError || !tournament ? (
        <p className="text-danger text-body">
          No pudimos cargar el torneo. Intentá de nuevo.
        </p>
      ) : locked ? (
        <>
          <p className="bg-surface-muted text-text-secondary rounded-lg px-4 py-2.5 text-body-sm">
            Los pronósticos del torneo están cerrados.
          </p>
          {dataReady ? (
            <LockedView
              prediction={predictionQuery.data ?? null}
              teams={teamsQuery.data ?? []}
              players={playersQuery.data ?? []}
            />
          ) : (
            <Skeleton className="h-48 w-full rounded-lg" />
          )}
        </>
      ) : (
        <>
          <p
            className="bg-brand-primary-soft text-brand-primary-hover rounded-lg px-4 py-2.5 text-body-sm font-medium"
            aria-live="polite"
          >
            Cierra en{' '}
            <span className="font-display font-bold tabular-nums">
              {formatCountdown(remaining)}
            </span>
          </p>
          {dataReady ? (
            <TournamentPredictionForm
              teams={teamsQuery.data ?? []}
              players={playersQuery.data ?? []}
              initial={predictionQuery.data ?? null}
              onSubmit={async (payload) => {
                await upsert.mutateAsync(payload)
              }}
            />
          ) : (
            <Skeleton className="h-64 w-full rounded-lg" />
          )}
        </>
      )}
    </div>
  )
}
