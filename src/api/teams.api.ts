import { apiClient } from '@/api/client'
import { mapTeam } from '@/api/matches.api'
import type { MatchTeamResponse } from '@/types/api'
import type { MatchTeam } from '@/features/matches/types'

export const teamsApi = {
  /**
   * Teams for a tournament (`GET /teams?tournament_id=`; the backend defaults
   * to the current tournament). A small, unpaginated array. Mapped via the
   * canonical `mapTeam` — one Team shape across the API (the endpoint's extra
   * `external_id` / `tournament_id` aren't needed here).
   */
  async list(tournamentId?: string): Promise<MatchTeam[]> {
    const response = await apiClient.get<MatchTeamResponse[]>('/teams', {
      params: tournamentId ? { tournament_id: tournamentId } : undefined,
    })
    return response.data
      .map((team) => mapTeam(team))
      .filter((team): team is MatchTeam => team !== null)
  },
}
