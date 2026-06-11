import { useQuery } from '@tanstack/react-query'
import { matchesApi } from '@/api/matches.api'
import { LIVE_POLL_INTERVAL_MS } from '@/features/matches/hooks/useMatch'
import type { Match } from '@/features/matches/types'

export interface NowMatch {
  /** The live match, or the next scheduled one as a fallback, or null. */
  match: Match | null
  /** True when `match` is currently in play (drives the live styling/polling). */
  isLive: boolean
  isLoading: boolean
}

/**
 * The "Ahora mismo" match: the in-play fixture if there is one, otherwise the
 * next scheduled one. The live list polls every 12s — both to refresh the live
 * score and to notice a kickoff — while the next fixture is fetched once. When a
 * live match is showing, its prediction/score updates ride the live poll; the
 * `next` query degrades to null until the backend ships `/matches/next`.
 */
export function useNowMatch(): NowMatch {
  const liveQuery = useQuery({
    queryKey: ['matches', 'live'],
    queryFn: () => matchesApi.live(),
    refetchInterval: LIVE_POLL_INTERVAL_MS,
  })

  const live = liveQuery.data ?? []
  const hasLive = live.length > 0

  const nextQuery = useQuery({
    queryKey: ['matches', 'next'],
    queryFn: () => matchesApi.next(),
  })

  return {
    match: hasLive ? live[0] : (nextQuery.data ?? null),
    isLive: hasLive,
    isLoading: liveQuery.isLoading || (!hasLive && nextQuery.isLoading),
  }
}
