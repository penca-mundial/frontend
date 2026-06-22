import { useQuery } from '@tanstack/react-query'
import { matchesApi } from '@/api/matches.api'
import { LIVE_POLL_INTERVAL_MS } from '@/features/matches/hooks/useMatch'
import type { Match } from '@/features/matches/types'

export interface NowMatch {
  /**
   * Every in-play fixture, ordered by kickoff. Holds more than one when matches
   * run concurrently (e.g. simultaneous group-stage games) so the home stacks
   * them all instead of hiding the rest behind the first.
   */
  liveMatches: Match[]
  /** The next scheduled fixture, shown (predictable) only when nothing is live. */
  nextMatch: Match | null
  isLoading: boolean
}

/**
 * The "Ahora mismo" matches: the in-play fixtures if there are any, otherwise
 * the next scheduled one. The live list polls every 12s — both to refresh live
 * scores and to notice a kickoff — while the next fixture is fetched once. When
 * live matches are showing, their prediction/score updates ride the live poll;
 * the `next` query degrades to null until the backend ships `/matches/next`.
 */
export function useNowMatch(): NowMatch {
  const liveQuery = useQuery({
    queryKey: ['matches', 'live'],
    queryFn: () => matchesApi.live(),
    refetchInterval: LIVE_POLL_INTERVAL_MS,
  })

  const liveMatches = liveQuery.data ?? []
  const hasLive = liveMatches.length > 0

  const nextQuery = useQuery({
    queryKey: ['matches', 'next'],
    queryFn: () => matchesApi.next(),
  })

  return {
    liveMatches,
    nextMatch: nextQuery.data ?? null,
    isLoading: liveQuery.isLoading || (!hasLive && nextQuery.isLoading),
  }
}
