import { get } from '@/api/client'
import type { GroupRankingResponse } from '@/types/api'
import type { RankingEntry } from '@/types/domain'

/** The current user's position within a group's leaderboard. */
export interface GroupRank {
  rankPosition: number
}

export const rankingsApi = {
  /**
   * The current user's rank in a group's leaderboard
   * (`GET /rankings/groups/:id?include_me=true&limit=1`, SCRUM-276). The cards
   * only need the `me` slice's position, so we ask for the smallest page.
   * Returns null when the user has no row yet.
   */
  async myGroupRank(groupId: string): Promise<GroupRank | null> {
    const data = await get<GroupRankingResponse>(
      `/rankings/groups/${groupId}`,
      { params: { include_me: true, limit: 1 } },
    )
    return data.me ? { rankPosition: data.me.rank_position } : null
  },

  // Global leaderboard arrives in Phase 7 (SCRUM-155).
  global(): Promise<RankingEntry[]> {
    throw new Error('Not implemented')
  },
}
