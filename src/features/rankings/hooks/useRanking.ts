import { useQuery } from '@tanstack/react-query'
import { rankingsApi, type RankingWindow } from '@/api/rankings.api'

/** Where the ranking comes from: the global pool, or one private group. */
export type RankingScope = 'global' | { groupId: string }

export interface UseRankingOptions {
  scope: RankingScope
  /** Time window (`total` by default — cumulative points). */
  window?: RankingWindow
}

/** Top rows fetched per leaderboard (pagination is SCRUM-280). */
const LIMIT = 100

/**
 * The leaderboard slice (top rows + the `me` window) for a scope and time
 * window. Each (scope, window) pair caches separately — switching tabs
 * refetches that combination only. Group slices share the
 * `['rankings', 'group', id, ...]` prefix with `useGroupRank` so a single
 * prefix invalidation refreshes both.
 */
export function useRanking({ scope, window = 'total' }: UseRankingOptions) {
  return useQuery({
    queryKey:
      scope === 'global'
        ? ['rankings', 'global', 'leaderboard', window]
        : ['rankings', 'group', scope.groupId, 'leaderboard', window],
    queryFn: () =>
      scope === 'global'
        ? rankingsApi.global(LIMIT, window)
        : rankingsApi.groupLeaderboard(scope.groupId, LIMIT, window),
    enabled: scope === 'global' || Boolean(scope.groupId),
  })
}
