import { DashboardCard } from '@/features/home/components/DashboardCard'
import {
  PODIUM_ROLES,
  TournamentPodium,
  type PodiumRow,
} from '@/features/tournament-predictions/components/TournamentPodium'
import type {
  ProfilePodium,
  ProfileTournamentPrediction,
} from '@/features/users/types'

/** The podium teams in `PODIUM_ROLES` order (champion → fourth place). */
const PODIUM_TEAM_KEYS = [
  'champion',
  'runnerUp',
  'thirdPlace',
  'fourthPlace',
] as const

/** Resolve the embedded podium into the shared `TournamentPodium` rows. */
function podiumRows(podium: ProfilePodium): PodiumRow[] {
  return PODIUM_ROLES.map(({ rank, role }, index) => {
    if (rank === 'scorer') {
      return {
        rank,
        role,
        flagUrl: podium.topScorer?.team?.flagUrl ?? null,
        name: podium.topScorer?.name ?? '—',
      }
    }
    const team = podium[PODIUM_TEAM_KEYS[index]]
    return { rank, role, flagUrl: team?.flagUrl ?? null, name: team?.name ?? '—' }
  })
}

/** Maps the server's gate reason to the message shown while it's hidden. */
const REASON_MESSAGE: Record<string, string> = {
  tournament_not_started: 'Se revela cuando arranca el Mundial.',
}

export interface ProfileTournamentPredictionBlockProps {
  prediction: ProfileTournamentPrediction
}

/**
 * "Pronóstico del torneo" on a public profile, reusing the home card's podium
 * style. Three states, all driven by the server-side gate (never re-derived in
 * the client):
 *   - hidden (`available:false`) → the reveal message for the gate reason;
 *   - revealed but empty (`podium:null`) → "No pronosticó el torneo";
 *   - revealed with a pick → the podium + scorer.
 */
export function ProfileTournamentPredictionBlock({
  prediction,
}: ProfileTournamentPredictionBlockProps) {
  return (
    <DashboardCard title="Pronóstico del torneo">
      {!prediction.available ? (
        <p className="text-text-secondary text-body-sm">
          {REASON_MESSAGE[prediction.reason] ??
            'Se revela cuando arranque el Mundial.'}
        </p>
      ) : prediction.podium === null ? (
        <p className="text-text-secondary text-body-sm">
          No pronosticó el torneo.
        </p>
      ) : (
        <TournamentPodium rows={podiumRows(prediction.podium)} />
      )}
    </DashboardCard>
  )
}
