import { useQuery } from '@tanstack/react-query'
import { standingsApi } from '@/api/standings.api'

const LIVE_REFETCH_MS = 30_000
const IDLE_REFETCH_MS = 5 * 60_000

export interface UseStandingsOptions {
  /** True when any match in view is live → poll fast (30s) instead of 5min. */
  hasLiveMatches: boolean
  /** Gate the fetch so standings only load when their view is shown. */
  enabled?: boolean
}

/**
 * Group standings for a tournament (`GET /standings?tournament_id=`). Server
 * state via TanStack Query — polls every 30s while a match is live and every
 * 5 minutes otherwise. `tournamentId` is optional (backend defaults to the
 * first tournament).
 */
export function useStandings(
  tournamentId: string | undefined,
  { hasLiveMatches, enabled = true }: UseStandingsOptions,
) {
  return useQuery({
    queryKey: ['standings', tournamentId ?? 'default'],
    queryFn: () => standingsApi.list(tournamentId),
    refetchInterval: hasLiveMatches ? LIVE_REFETCH_MS : IDLE_REFETCH_MS,
    enabled,
  })
}
