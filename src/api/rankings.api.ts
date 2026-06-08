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

export interface LeaderboardPageOptions {
  /** 1-based page (SCRUM-280). */
  page?: number
  /** Rows per page — backend default 25, capped at 100. */
  perPage?: number
  window?: RankingWindow
  /**
   * Ask for the "me" context window (the current user's row + neighbours).
   * It rides an unpaginated path server-side and is identical on every page —
   * request it on the first page only.
   */
  includeMe?: boolean
}

/** One leaderboard page: the ranked rows plus the optional `me` window. */
export interface LeaderboardPage {
  entries: RankingEntry[]
  me: RankingEntry[]
  page: number
  hasMore: boolean
}

function mapPage(data: LeaderboardResponse): LeaderboardPage {
  return {
    entries: data.entries.map(mapEntry),
    me: (data.me ?? []).map(mapEntry),
    page: data.page,
    hasMore: data.has_more,
  }
}

function toParams({
  page = 1,
  perPage = 25,
  window = 'total',
  includeMe = false,
}: LeaderboardPageOptions) {
  return {
    page,
    per_page: perPage,
    window,
    // Only travels when requested — the "me" path costs an extra query
    // server-side and its result never changes across pages.
    ...(includeMe ? { include_me: true } : {}),
  }
}

export const rankingsApi = {
  /**
   * A group's leaderboard page (`GET /rankings/groups/:id`, SCRUM-276;
   * `window` SCRUM-155; `page`/`per_page`/`has_more` pagination SCRUM-280).
   * `me` is a window around the current user (their row + neighbours) so the
   * caller can show their position even when they rank past the loaded rows.
   * Maps everything to camelCase.
   */
  async groupLeaderboard(
    groupId: string,
    options: LeaderboardPageOptions = {},
  ): Promise<LeaderboardPage> {
    const data = await get<LeaderboardResponse>(`/rankings/groups/${groupId}`, {
      params: toParams(options),
    })
    return mapPage(data)
  },

  /**
   * The global (everyone-in) leaderboard (`GET /rankings/global`, SCRUM-155).
   * Same page shape and params as the group endpoint.
   */
  async global(options: LeaderboardPageOptions = {}): Promise<LeaderboardPage> {
    const data = await get<LeaderboardResponse>('/rankings/global', {
      params: toParams(options),
    })
    return mapPage(data)
  },
}
