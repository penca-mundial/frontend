import { isAxiosError } from 'axios'
import { apiClient, get } from '@/api/client'
import { mapPrediction } from '@/api/predictions.api'
import type { MatchResponse, MatchTeamResponse } from '@/types/api'
import type {
  Match,
  MatchPhase,
  MatchStatus,
  MatchTeam,
} from '@/features/matches/types'

/** Server-side filters accepted by `GET /matches`. */
export interface MatchListFilters {
  phase?: MatchPhase
  status?: MatchStatus
  /** Inclusive ISO date (yyyy-MM-dd). */
  dateFrom?: string
  dateTo?: string
  teamId?: string
}

export interface MatchListResult {
  matches: Match[]
  totalCount: number
  page: number
  perPage: number
}

export function mapTeam(team: MatchTeamResponse | null): MatchTeam | null {
  if (team === null) return null
  return {
    id: String(team.id),
    name: team.name,
    code3: team.code3,
    flagUrl: team.flag_url,
  }
}

/** Map the backend (snake_case, numeric ids) match to the domain type. */
export function mapMatch(match: MatchResponse): Match {
  return {
    id: String(match.id),
    externalId: match.external_id,
    tournamentId: String(match.tournament_id),
    kickoffAt: match.kickoff_at,
    status: match.status as MatchStatus,
    phase: match.phase as MatchPhase,
    group: match.group ?? null,
    minute: match.minute ?? null,
    homeScore: match.home_score,
    awayScore: match.away_score,
    advancingTeamId:
      match.advancing_team_id === null
        ? null
        : String(match.advancing_team_id),
    homeTeam: mapTeam(match.home_team),
    awayTeam: mapTeam(match.away_team),
    // Present (possibly null) only on `GET /matches/:id` for a signed-in user.
    myPrediction:
      match.my_prediction === undefined
        ? undefined
        : match.my_prediction === null
          ? null
          : mapPrediction(match.my_prediction),
    // Only on the live endpoint once the backend embeds it; null otherwise.
    projectedPoints: match.projected_points ?? null,
  }
}

export const matchesApi = {
  /**
   * List fixtures (`GET /matches`, paginated). The backend renders a bare JSON
   * array and exposes the total via the `X-Total-Count` header, so we read it
   * off the response rather than a body envelope.
   */
  async list(
    filters: MatchListFilters = {},
    page = 1,
    perPage = 100,
  ): Promise<MatchListResult> {
    const response = await apiClient.get<MatchResponse[]>('/matches', {
      params: {
        phase: filters.phase,
        status: filters.status,
        date_from: filters.dateFrom,
        date_to: filters.dateTo,
        team_id: filters.teamId,
        page,
        per_page: perPage,
      },
    })
    const totalHeader = response.headers['x-total-count']
    return {
      matches: response.data.map(mapMatch),
      totalCount: totalHeader ? Number(totalHeader) : response.data.length,
      page,
      perPage,
    }
  },

  /** A single fixture (`GET /matches/:id`), including the user's prediction. */
  async get(id: string): Promise<Match> {
    const response = await get<MatchResponse>(`/matches/${id}`)
    return mapMatch(response)
  },

  /**
   * The currently in-play matches (`GET /matches/live`), ordered by kickoff.
   * A bare JSON array; usually 0–1 rows for the dashboard's "Ahora mismo" card.
   */
  async live(): Promise<Match[]> {
    const data = await get<MatchResponse[]>('/matches/live')
    return data.map(mapMatch)
  },

  /**
   * The next scheduled fixture (`GET /matches/next`), the "Ahora mismo" fallback
   * when nothing is live. Includes the user's prediction (`my_prediction`) like
   * `GET /matches/:id`. Degrades to `null` while the backend endpoint is still
   * undeployed: until then the route falls through to `matches/:id` with
   * id="next" and 404s — which we read as "no data yet" (backend gap A/B).
   */
  async next(): Promise<Match | null> {
    return getOptionalMatch('/matches/next')
  },

  /**
   * The most recently finished fixture (`GET /matches/last_finished`) with the
   * user's prediction, for the "Último resultado" card. Same graceful-404
   * degradation as `next()` until the backend ships it.
   */
  async lastFinished(): Promise<Match | null> {
    return getOptionalMatch('/matches/last_finished')
  },
}

/**
 * Fetch a single optional match, mapping a 404 (route not deployed yet, or no
 * such match) to `null` so the dashboard degrades gracefully instead of error.
 * Any other failure rejects as usual.
 */
async function getOptionalMatch(path: string): Promise<Match | null> {
  try {
    const data = await get<MatchResponse | null>(path)
    return data ? mapMatch(data) : null
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}
