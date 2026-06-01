import type { MatchTeam } from '@/features/matches/types'

/**
 * The current tournament as the app consumes it (camelCase, from
 * `GET /tournaments/current`). `isLocked` / `secondsUntilKickoff` are derived
 * server-side and gate the tournament-prediction UI.
 */
export interface Tournament {
  id: string
  name: string
  startsAt: string
  endsAt: string | null
  externalCode: string | null
  championId: string | null
  runnerUpId: string | null
  thirdPlaceId: string | null
  fourthPlaceId: string | null
  topScorerId: string | null
  isLocked: boolean
  secondsUntilKickoff: number
}

/** A player with its (compact) team — the canonical `MatchTeam` shape. */
export interface Player {
  id: string
  name: string
  externalId: string | null
  teamId: string
  team: MatchTeam | null
}

/**
 * A user's tournament-wide prediction (podium + top scorer). `locked` is
 * derived from the tournament start so the UI can disable editing.
 */
export interface TournamentPrediction {
  id: string
  tournamentId: string
  championId: string | null
  runnerUpId: string | null
  thirdPlaceId: string | null
  fourthPlaceId: string | null
  topScorerId: string | null
  lockedAt: string | null
  locked: boolean
}
