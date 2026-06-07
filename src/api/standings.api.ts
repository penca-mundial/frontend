import { apiClient } from '@/api/client'
import { mapTeam } from '@/api/matches.api'
import type { ComputedGroupStandings, ComputedStandingRow } from '@/types/api'
import type { GroupStandings, Standing } from '@/features/matches/types'

/**
 * Map a computed (snake_case) standing row to the domain type. The computed
 * endpoint carries no row id or form string, so we synthesize a stable key
 * from the group + team (falling back to position) and leave `form` null.
 */
function mapStanding(row: ComputedStandingRow, group: string): Standing {
  const team = mapTeam(row.team)
  return {
    id: team ? `${group}-${team.id}` : `${group}-${row.position}`,
    group,
    position: row.position,
    playedGames: row.played,
    won: row.won,
    draw: row.drawn,
    lost: row.lost,
    goalsFor: row.goals_for,
    goalsAgainst: row.goals_against,
    goalDifference: row.goal_difference,
    points: row.points,
    form: null,
    team,
  }
}

/** Shared mapping for both standings variants (same blueprint server-side). */
function mapGroups(groups: ComputedGroupStandings[] | null): GroupStandings[] {
  return (groups ?? [])
    .map((group) => ({
      group: group.name,
      rows: group.standings.map((row) => mapStanding(row, group.name)),
    }))
    .sort((a, b) => a.group.localeCompare(b.group, 'es'))
}

export const standingsApi = {
  /**
   * Computed group standings for a tournament
   * (`GET /tournaments/:id/standings`, SCRUM-244). The tables are derived from
   * the matches — pre-tournament returns every group with its teams at 0, stats
   * update live during — so an empty array is the only "no data" signal. Rows
   * come ordered within each group (points → goal difference → goals for); we
   * map to camelCase and sort the groups alphabetically by name.
   */
  async list(tournamentId: string): Promise<GroupStandings[]> {
    const response = await apiClient.get<ComputedGroupStandings[]>(
      `/tournaments/${tournamentId}/standings`,
    )
    return mapGroups(response.data)
  },

  /**
   * Group standings PROJECTED for the current user
   * (`GET /tournaments/:id/standings/projected`, SCRUM-294 — authenticated).
   * Same shape as the official variant: `played/won/drawn/lost` are official,
   * while `points/goals_for/goals_against/goal_difference/position` come
   * already blended with the user's predictions (the backend does the mix).
   */
  async listProjected(tournamentId: string): Promise<GroupStandings[]> {
    const response = await apiClient.get<ComputedGroupStandings[]>(
      `/tournaments/${tournamentId}/standings/projected`,
    )
    return mapGroups(response.data)
  },
}
