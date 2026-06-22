import { apiClient } from '@/api/client'
import { mapTeam } from '@/api/matches.api'
import type {
  BracketMatchResponse,
  BracketPredictionResponse,
  BracketResponse,
  ProjectedBracketResponse,
  ProjectedBracketSlotResponse,
} from '@/types/api'
import type {
  BracketMatch,
  BracketPrediction,
  MatchPhase,
  MatchStatus,
  ProjectedBracket,
  ProjectedBracketSlot,
} from '@/features/matches/types'

/** Map the gated pick; ids normalised at the boundary (ADR 0004). */
function mapBracketPrediction(
  prediction: BracketPredictionResponse,
): BracketPrediction {
  return {
    id: String(prediction.id),
    matchId: String(prediction.match_id),
    predictedHomeScore: prediction.predicted_home_score,
    predictedAwayScore: prediction.predicted_away_score,
    predictedAdvancingTeamId:
      prediction.predicted_advancing_team_id === null
        ? null
        : String(prediction.predicted_advancing_team_id),
    locked: prediction.locked,
    pointsEarned: prediction.points_earned,
  }
}

/** Map a bracket match (snake_case, numeric ids) to the domain type. */
export function mapBracketMatch(match: BracketMatchResponse): BracketMatch {
  return {
    id: String(match.id),
    phase: match.phase as MatchPhase,
    status: match.status as MatchStatus,
    kickoffAt: match.kickoff_at,
    minute: match.minute ?? null,
    homeScore: match.home_score,
    awayScore: match.away_score,
    advancingTeamId:
      match.advancing_team_id === null ? null : String(match.advancing_team_id),
    homeTeam: mapTeam(match.home_team),
    awayTeam: mapTeam(match.away_team),
    feedsIntoMatchId:
      match.feeds_into_match_id === null
        ? null
        : String(match.feeds_into_match_id),
    feedsIntoSlot: match.feeds_into_slot,
    bracketPosition: match.bracket_position,
    myPrediction: match.my_prediction
      ? mapBracketPrediction(match.my_prediction)
      : null,
  }
}

/** Map one projected Round-of-32 slot (teams normalised, null = "A definir"). */
function mapProjectedSlot(
  slot: ProjectedBracketSlotResponse,
): ProjectedBracketSlot {
  return {
    bracketPosition: slot.bracket_position,
    home: mapTeam(slot.home),
    away: mapTeam(slot.away),
    source: slot.source,
  }
}

/** Map the projected bracket payload to the domain type. */
export function mapProjectedBracket(
  payload: ProjectedBracketResponse,
): ProjectedBracket {
  return {
    projected: payload.projected,
    roundOf32: payload.round_of_32.map(mapProjectedSlot),
  }
}

export const bracketApi = {
  /**
   * The knockout bracket (`GET /tournaments/:id/bracket`): existing KO matches
   * with their topology and the viewer's gated pick, already ordered by round +
   * bracket_position.
   */
  async get(tournamentId: string): Promise<BracketMatch[]> {
    const response = await apiClient.get<BracketResponse>(
      `/tournaments/${tournamentId}/bracket`,
    )
    return response.data.matches.map(mapBracketMatch)
  },

  /**
   * The PROJECTED Round-of-32 for the signed-in viewer
   * (`GET /tournaments/:id/bracket/projected`, authed). `projected` governs
   * whether the SPA shows this or falls back to the official bracket.
   */
  async getProjected(tournamentId: string): Promise<ProjectedBracket> {
    const response = await apiClient.get<ProjectedBracketResponse>(
      `/tournaments/${tournamentId}/bracket/projected`,
    )
    return mapProjectedBracket(response.data)
  },
}
