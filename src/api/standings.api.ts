import { apiClient } from '@/api/client'
import { mapTeam } from '@/api/matches.api'
import type { StandingResponse, StandingsResponse } from '@/types/api'
import type { GroupStandings, Standing } from '@/features/matches/types'

/** Map the backend (snake_case) standing row to the domain type. */
function mapStanding(row: StandingResponse): Standing {
  return {
    id: String(row.id),
    group: row.group,
    position: row.position,
    playedGames: row.played_games,
    won: row.won,
    draw: row.draw,
    lost: row.lost,
    goalsFor: row.goals_for,
    goalsAgainst: row.goals_against,
    goalDifference: row.goal_difference,
    points: row.points,
    form: row.form,
    team: mapTeam(row.team),
  }
}

export const standingsApi = {
  /**
   * Group standings for a tournament (`GET /standings?tournament_id=`, flat
   * query param; the backend defaults to the first tournament when omitted).
   * The response is `{ groups: { A: [...], ... } }` ordered by position within
   * each group; we map to camelCase and return the groups sorted alphabetically
   * (no hardcoded group set — derived from whatever the data contains).
   */
  async list(tournamentId?: string): Promise<GroupStandings[]> {
    const response = await apiClient.get<StandingsResponse>('/standings', {
      params: tournamentId ? { tournament_id: tournamentId } : undefined,
    })
    return Object.entries(response.data.groups ?? {})
      .map(([group, rows]) => ({ group, rows: rows.map(mapStanding) }))
      .sort((a, b) => a.group.localeCompare(b.group, 'es'))
  },
}
