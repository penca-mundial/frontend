import { get } from '@/api/client'
import type { LeaderboardResponse, RankingEntryResponse } from '@/types/api'
import type { RankingEntry } from '@/types/domain'

/**
 * Ranking time window (SCRUM-155): `total` is cumulative, `today` is the delta
 * since UTC midnight, `week` the delta over the last 7 days. The backend
 * defaults to `total` and silently falls back to it on unknown values.
 */
export type RankingWindow = 'total' | 'today' | 'week'

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

/** A leaderboard slice: the top `entries` plus the `me` window. */
export interface LeaderboardSlice {
  entries: RankingEntry[]
  me: RankingEntry[]
}

function mapSlice(data: LeaderboardResponse): LeaderboardSlice {
  return {
    entries: data.entries.map(mapEntry),
    me: (data.me ?? []).map(mapEntry),
  }
}

export const rankingsApi = {
  /**
   * A group's leaderboard (`GET /rankings/groups/:id?include_me=true`,
   * SCRUM-276; `window` added in SCRUM-155). `entries` is the top `limit`
   * rows; `me` is a window around the current user (their row + neighbours)
   * so the caller can show their position even when they rank past the top.
   * Maps everything to camelCase.
   */
  async groupLeaderboard(
    groupId: string,
    limit = 100,
    window: RankingWindow = 'total',
  ): Promise<LeaderboardSlice> {
    const data = await get<LeaderboardResponse>(
      `/rankings/groups/${groupId}`,
      { params: { include_me: true, limit, window } },
    )
    return mapSlice(data)
  },

  /**
   * The global (everyone-in) leaderboard (`GET /rankings/global`, SCRUM-155).
   * Same slice shape and params as the group endpoint.
   */
  async global(
    limit = 100,
    window: RankingWindow = 'total',
  ): Promise<LeaderboardSlice> {
    const data = await get<LeaderboardResponse>('/rankings/global', {
      params: { include_me: true, limit, window },
    })
    return mapSlice(data)
  },
}
