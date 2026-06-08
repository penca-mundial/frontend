import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import {
  rankingsApi,
  type LeaderboardPage,
  type RankingWindow,
} from '@/api/rankings.api'
import type { RankingEntry } from '@/types/domain'

/** Where the ranking comes from: the global pool, or one private group. */
export type RankingScope = 'global' | { groupId: string }

export interface UseRankingOptions {
  scope: RankingScope
  /** Time window (`total` by default — cumulative points). */
  window?: RankingWindow
}

export interface UseRankingResult {
  /** Every loaded row, pages appended in order. */
  entries: RankingEntry[]
  /** The `me` window from the first page — identical on every page. */
  me: RankingEntry[]
  isLoading: boolean
  isError: boolean
  /** True while the backend reports more ranked pages past the loaded ones. */
  hasMore: boolean
  /** Fetch-and-append the next page ("Ver más jugadores"). */
  loadMore: () => void
  isLoadingMore: boolean
}

/**
 * The leaderboard for a scope and time window, paginated 25-per-page via an
 * infinite query (`page`/`has_more`, SCRUM-280): `loadMore` APPENDS the next
 * page to `entries`. The `me` window rides `include_me=true` on the FIRST
 * page only — the backend computes it unpaginated, so it never varies with
 * the loaded depth. Each (scope, window) pair caches separately — switching
 * tabs refetches that combination only. Group slices share the
 * `['rankings', 'group', id, ...]` prefix with `useGroupRank` so a single
 * prefix invalidation refreshes both.
 */
export function useRanking({
  scope,
  window = 'total',
}: UseRankingOptions): UseRankingResult {
  const query = useInfiniteQuery({
    queryKey:
      scope === 'global'
        ? ['rankings', 'global', 'leaderboard', window]
        : ['rankings', 'group', scope.groupId, 'leaderboard', window],
    queryFn: ({ pageParam }): Promise<LeaderboardPage> => {
      const options = {
        page: pageParam,
        window,
        // The "me" window is page-independent; one request is enough.
        includeMe: pageParam === 1,
      }
      return scope === 'global'
        ? rankingsApi.global(options)
        : rankingsApi.groupLeaderboard(scope.groupId, options)
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: scope === 'global' || Boolean(scope.groupId),
  })

  const entries = useMemo(
    () => query.data?.pages.flatMap((page) => page.entries) ?? [],
    [query.data],
  )

  return {
    entries,
    me: query.data?.pages[0]?.me ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    hasMore: query.hasNextPage,
    loadMore: query.fetchNextPage,
    isLoadingMore: query.isFetchingNextPage,
  }
}
