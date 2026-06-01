import { SectionLabel } from '@/components/ui/section-label'
import { TeamFlag } from '@/features/tournament-predictions/components/TeamFlag'
import type { MatchTeam } from '@/features/matches/types'
import type {
  Player,
  TournamentPrediction,
} from '@/features/tournament-predictions/types'
import { cn } from '@/lib/cn'

export type SummarySpot =
  | 'championId'
  | 'runnerUpId'
  | 'thirdPlaceId'
  | 'fourthPlaceId'
  | 'topScorer'

const SPOT_LABELS: Record<SummarySpot, string> = {
  championId: 'Campeón',
  runnerUpId: 'Subcampeón',
  thirdPlaceId: 'Tercer puesto',
  fourthPlaceId: 'Cuarto puesto',
  topScorer: 'Goleador',
}

/** Full podium + top scorer — the locked read-only view on the prediction page. */
export const FULL_SUMMARY_SPOTS: SummarySpot[] = [
  'championId',
  'runnerUpId',
  'thirdPlaceId',
  'fourthPlaceId',
  'topScorer',
]

/** Compact set for the home card per the mock: champion + runner-up + scorer. */
export const COMPACT_SUMMARY_SPOTS: SummarySpot[] = [
  'championId',
  'runnerUpId',
  'topScorer',
]

interface SummaryRow {
  label: string
  flagUrl: string | null
  name: string
}

/** Resolve a spot to its label + the picked team/player's flag and name. */
function resolveRow(
  spot: SummarySpot,
  prediction: TournamentPrediction,
  teams: MatchTeam[],
  players: Player[],
): SummaryRow {
  const label = SPOT_LABELS[spot]
  if (spot === 'topScorer') {
    const player = prediction.topScorerId
      ? (players.find((p) => p.id === prediction.topScorerId) ?? null)
      : null
    return {
      label,
      flagUrl: player?.team?.flagUrl ?? null,
      name: player?.name ?? '—',
    }
  }
  const teamId = prediction[spot]
  const team = teamId ? (teams.find((t) => t.id === teamId) ?? null) : null
  return { label, flagUrl: team?.flagUrl ?? null, name: team?.name ?? '—' }
}

export interface TournamentPredictionSummaryProps {
  prediction: TournamentPrediction
  teams: MatchTeam[]
  players: Player[]
  /** Which rows to render, in order. Defaults to the full podium + scorer. */
  spots?: SummarySpot[]
  /** Extends the container chrome (e.g. drop the border inside a card). */
  className?: string
}

/**
 * Read-only summary of a tournament prediction as flag + name rows
 * (label-left / value-right). Parametrizable by which spots to show, so the
 * same render powers the locked prediction page (full set) and the home card
 * (compact set). Teams/players resolve the ids; a missing pick renders "—".
 */
export function TournamentPredictionSummary({
  prediction,
  teams,
  players,
  spots = FULL_SUMMARY_SPOTS,
  className,
}: TournamentPredictionSummaryProps) {
  return (
    <dl
      className={cn(
        'border-border bg-surface divide-border divide-y rounded-xl border',
        className,
      )}
    >
      {spots.map((spot) => {
        const { label, flagUrl, name } = resolveRow(
          spot,
          prediction,
          teams,
          players,
        )
        return (
          <div
            key={spot}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <SectionLabel as="dt" tone="secondary">
              {label}
            </SectionLabel>
            <dd className="flex items-center gap-2 text-body-sm font-semibold">
              <TeamFlag flagUrl={flagUrl} />
              {name}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
