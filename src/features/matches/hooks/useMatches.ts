import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { matchesApi, type MatchListFilters } from '@/api/matches.api'

/**
 * Fetch the fixture list for the given server-side filters (phase, date range,
 * status, team). Keeps the previous page's data while refetching so the list
 * doesn't flash empty when filters change. The query key mirrors the
 * `['matches', ...]` namespace invalidated after a prediction upsert.
 */
export function useMatches(filters: MatchListFilters = {}, page = 1) {
  return useQuery({
    queryKey: ['matches', filters, page],
    queryFn: () => matchesApi.list(filters, page),
    placeholderData: keepPreviousData,
  })
}
