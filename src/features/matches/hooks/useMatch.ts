import { useQuery } from '@tanstack/react-query'
import { matchesApi } from '@/api/matches.api'
import type { MatchStatus } from '@/features/matches/types'

/** Live matches poll every 12s; everything else fetches once (no interval). */
export const LIVE_POLL_INTERVAL_MS = 12_000

export function pollIntervalFor(status: MatchStatus | undefined): number | false {
  return status === 'live' ? LIVE_POLL_INTERVAL_MS : false
}

/**
 * Fetch a single match (`GET /matches/:id`), including the signed-in user's
 * prediction. While the match is live the query polls every 12s so the live
 * scoreboard stays current; otherwise it fetches once.
 */
export function useMatch(id: string) {
  return useQuery({
    queryKey: ['match', id],
    queryFn: () => matchesApi.get(id),
    enabled: Boolean(id),
    refetchInterval: (query) => pollIntervalFor(query.state.data?.status),
  })
}
