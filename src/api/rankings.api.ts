import { get } from '@/api/client'
import type { GroupRankingResponse, RankingEntryResponse } from '@/types/api'
import type { RankingEntry } from '@/types/domain'

/** Map a leaderboard row (snake_case) to the domain type. */
function mapEntry(entry: RankingEntryResponse): RankingEntry {
  return {
    userId: String(entry.user_id),
    username: entry.username,
    points: entry.points,
    position: entry.rank_position,
    exactCount: entry.exact_count,
    avatarUrl: entry.avatar_url,
  }
}

/** A group's leaderboard slice: the top `entries` plus the `me` window. */
export interface GroupLeaderboardSlice {
  entries: RankingEntry[]
  me: RankingEntry[]
}

export const rankingsApi = {
  /**
   * A group's leaderboard (`GET /rankings/groups/:id?include_me=true`,
   * SCRUM-276). `entries` is the top `limit` rows; `me` is a window around the
   * current user (their row + neighbours) so the caller can show their position
   * even when they rank past the top. Maps everything to camelCase.
   */
  async groupLeaderboard(
    groupId: string,
    limit = 100,
  ): Promise<GroupLeaderboardSlice> {
    const data = await get<GroupRankingResponse>(
      `/rankings/groups/${groupId}`,
      { params: { include_me: true, limit } },
    )
    return {
      entries: data.entries.map(mapEntry),
      me: (data.me ?? []).map(mapEntry),
    }
  },

  // Global leaderboard arrives in Phase 7 (SCRUM-155).
  global(): Promise<RankingEntry[]> {
    throw new Error('Not implemented')
  },
}
