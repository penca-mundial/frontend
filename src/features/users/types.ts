import type { Match, MatchTeam } from '@/features/matches/types'
import type { Player } from '@/features/tournament-predictions/types'

/** The viewed user's identity on the public profile (camelCase, ids as strings). */
export interface PublicProfileUser {
  id: string
  username: string | null
  avatarUrl: string | null
}

/** The viewed user's row in the global leaderboard + the universe size. */
export interface ProfileGlobalRanking {
  /** 1-based rank; null when the user has no scored predictions yet. */
  rankPosition: number | null
  points: number
  exactCount: number
  total: number
}

/** The viewed user's standing in a penca both viewer and target belong to. */
export interface ProfileSharedGroup {
  id: string
  name: string
  isGeneralPool: boolean
  rankPosition: number | null
  points: number
  total: number
}

/** The viewed user's tournament-wide podium + top scorer, teams/player resolved. */
export interface ProfilePodium {
  champion: MatchTeam | null
  runnerUp: MatchTeam | null
  thirdPlace: MatchTeam | null
  fourthPlace: MatchTeam | null
  topScorer: Player | null
}

/**
 * The gated tournament prediction: hidden until the first kickoff
 * (`available:false` + a reason), then the podium (or null if they made none).
 */
export type ProfileTournamentPrediction =
  | { available: false; reason: string }
  | { available: true; podium: ProfilePodium | null }

/** Accuracy buckets over the viewed user's scored predictions. */
export interface ProfileStats {
  exact: number
  correctWinner: number
  goalDifference: number
  missed: number
  total: number
}

/** The full public profile (`GET /users/:id/profile`). */
export interface PublicUserProfile {
  user: PublicProfileUser
  globalRanking: ProfileGlobalRanking
  sharedGroups: ProfileSharedGroup[]
  tournamentPrediction: ProfileTournamentPrediction
  stats: ProfileStats
}

/**
 * A page of the viewed user's locked picks. Each entry is a `Match` with its
 * `myPrediction` set to the viewed user's pick, so the home `ResultCard` renders
 * it unchanged (the lock/reveal gate lives server-side — only locked picks
 * reach here). Live match first, then finished by kickoff descending.
 */
export interface UserPredictionsPage {
  entries: Match[]
  page: number
  hasMore: boolean
}
