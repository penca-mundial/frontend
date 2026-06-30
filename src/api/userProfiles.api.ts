import { apiClient } from '@/api/client'
import { mapMatch, mapTeam } from '@/api/matches.api'
import { mapPlayer } from '@/api/players.api'
import type {
  EmbeddedTournamentPredictionResponse,
  ProfilePredictionPickResponse,
  ProfileTournamentPredictionResponse,
  UserPredictionsResponse,
  UserProfileResponse,
} from '@/types/api'
import type { Prediction } from '@/features/predictions/types'
import type {
  ProfilePodium,
  ProfileTournamentPrediction,
  PublicUserProfile,
  UserPredictionsPage,
} from '@/features/users/types'

/** Resolve the embedded podium teams + scorer (ids normalised by the leaf mappers). */
function mapPodium(
  prediction: EmbeddedTournamentPredictionResponse,
): ProfilePodium {
  return {
    champion: mapTeam(prediction.champion),
    runnerUp: mapTeam(prediction.runner_up),
    thirdPlace: mapTeam(prediction.third_place),
    fourthPlace: mapTeam(prediction.fourth_place),
    topScorer: prediction.top_scorer ? mapPlayer(prediction.top_scorer) : null,
  }
}

function mapTournamentPrediction(
  tournamentPrediction: ProfileTournamentPredictionResponse,
): ProfileTournamentPrediction {
  if (!tournamentPrediction.available) {
    return { available: false, reason: tournamentPrediction.reason }
  }
  return {
    available: true,
    podium: tournamentPrediction.prediction
      ? mapPodium(tournamentPrediction.prediction)
      : null,
  }
}

/** Map the backend (snake_case, numeric ids) profile to the domain type. */
export function mapUserProfile(profile: UserProfileResponse): PublicUserProfile {
  return {
    user: {
      id: String(profile.user.id),
      username: profile.user.username,
      avatarUrl: profile.user.avatar_url,
    },
    globalRanking: {
      rankPosition: profile.global_ranking.rank_position,
      points: profile.global_ranking.points,
      exactCount: profile.global_ranking.exact_count,
      total: profile.global_ranking.total,
    },
    sharedGroups: profile.shared_groups.map((entry) => ({
      id: String(entry.group.id),
      name: entry.group.name,
      isGeneralPool: entry.group.is_general_pool,
      rankPosition: entry.rank_position,
      points: entry.points,
      total: entry.total,
    })),
    tournamentPrediction: mapTournamentPrediction(profile.tournament_prediction),
    stats: {
      exact: profile.stats.exact,
      correctWinner: profile.stats.correct_winner,
      goalDifference: profile.stats.goal_difference,
      missed: profile.stats.missed,
      total: profile.stats.total,
    },
  }
}

/**
 * Adapt the compact pick projection (scores, advancing team, points) to the
 * domain `Prediction` the `ResultCard` consumes — including the advancing pick
 * so the KO "Avance" chip shows on profiles. The feed is locked by construction,
 * so the lock fields are synthesised; the rest carries real data.
 */
function mapPick(
  pick: ProfilePredictionPickResponse,
  matchId: string,
): Prediction {
  return {
    id: `${matchId}:pick`,
    matchId,
    predictedHomeScore: pick.predicted_home_score,
    predictedAwayScore: pick.predicted_away_score,
    predictedAdvancingTeamId:
      pick.predicted_advancing_team_id === null
        ? null
        : String(pick.predicted_advancing_team_id),
    lockedAt: null,
    locked: true,
    points: pick.points,
  }
}

/** Map a predictions page; each entry becomes a `Match` carrying its pick. */
export function mapUserPredictionsPage(
  page: UserPredictionsResponse,
): UserPredictionsPage {
  return {
    entries: page.entries.map((entry) => {
      const match = mapMatch(entry)
      return { ...match, myPrediction: mapPick(entry.prediction, match.id) }
    }),
    page: page.page,
    hasMore: page.has_more,
  }
}

export const userProfilesApi = {
  /** The viewed user's public profile (`GET /users/:id/profile`). */
  async profile(userId: string): Promise<PublicUserProfile> {
    const response = await apiClient.get<UserProfileResponse>(
      `/users/${userId}/profile`,
    )
    return mapUserProfile(response.data)
  },

  /**
   * The viewed user's locked match picks (`GET /users/:id/predictions`,
   * paginated — live match first, then finished by kickoff descending).
   */
  async predictions(
    userId: string,
    page = 1,
    perPage = 10,
  ): Promise<UserPredictionsPage> {
    const response = await apiClient.get<UserPredictionsResponse>(
      `/users/${userId}/predictions`,
      { params: { page, per_page: perPage } },
    )
    return mapUserPredictionsPage(response.data)
  },
}
