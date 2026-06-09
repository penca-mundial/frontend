import { get } from '@/api/client'
import type {
  GroupEvolutionResponse,
  LeaderboardResponse,
  RankingEntryResponse,
} from '@/types/api'
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

/** One point of an evolution line (the series shape passes through verbatim). */
export interface EvolutionPoint {
  date: string
  points: number
  rank: number
}

/** One chart line: the user identity plus their dated series. */
export interface EvolutionLine {
  userId: string
  username: string | null
  avatarUrl: string | null
  series: EvolutionPoint[]
}

/** Per-penca points/rank evolution (`GET /rankings/groups/:id/evolution`). */
export interface GroupEvolution {
  available: boolean
  lines: EvolutionLine[]
}

/** One leaderboard page: the ranked rows plus the optional `me` window. */
export interface LeaderboardPage {
  entries: RankingEntry[]
  me: RankingEntry[]
  page: number
  hasMore: boolean
  /** Total ranked participants, or null until the backend exposes it. */
  total: number | null
}

function mapPage(data: LeaderboardResponse): LeaderboardPage {
  return {
    entries: data.entries.map(mapEntry),
    me: (data.me ?? []).map(mapEntry),
    page: data.page,
    hasMore: data.has_more,
    total: data.total ?? null,
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

  /**
   * A penca's points/rank evolution (`GET /rankings/groups/:id/evolution`,
   * SCRUM-286/302). Up to 5 lines (group top 4 + the current user); `available`
   * is false with no lines until the tournament has ≥5 finished matches. Ids
   * are normalized to strings at the boundary (ADR 0004); the series passes
   * through verbatim.
   */
  async groupEvolution(groupId: string): Promise<GroupEvolution> {
    const data = await get<GroupEvolutionResponse>(
      `/rankings/groups/${groupId}/evolution`,
    )
    return {
      available: data.available,
      lines: (data.lines ?? []).map((line) => ({
        userId: String(line.user.id),
        username: line.user.username,
        avatarUrl: line.user.avatar_url,
        series: line.series,
      })),
    }
  },
}
