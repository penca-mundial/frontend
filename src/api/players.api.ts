import { apiClient } from '@/api/client'
import { mapTeam } from '@/api/matches.api'
import type { PlayerResponse } from '@/types/api'
import type { Player } from '@/features/tournament-predictions/types'

/** Map the backend (snake_case) player to the domain type. */
export function mapPlayer(player: PlayerResponse): Player {
  return {
    id: String(player.id),
    name: player.name,
    externalId: player.external_id,
    teamId: String(player.team_id),
    team: mapTeam(player.team),
  }
}

export const playersApi = {
  /**
   * The full player list for a tournament (`GET /players?tournament_id=`). The
   * endpoint paginates (default 25), but the World Cup has ~1200 players and the
   * consumer autocompletes client-side, so we read the total from
   * `X-Total-Count` and re-fetch the whole list in one sized request.
   */
  async list(tournamentId?: string): Promise<Player[]> {
    const scope = tournamentId ? { tournament_id: tournamentId } : {}
    const probe = await apiClient.get<PlayerResponse[]>('/players', {
      params: { ...scope, page: 1, per_page: 1 },
    })
    const total = Number(probe.headers['x-total-count'] ?? probe.data.length)
    if (total <= probe.data.length) {
      return probe.data.map(mapPlayer)
    }
    const full = await apiClient.get<PlayerResponse[]>('/players', {
      params: { ...scope, page: 1, per_page: total },
    })
    return full.data.map(mapPlayer)
  },
}
