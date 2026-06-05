import { useQuery } from '@tanstack/react-query'
import { standingsApi } from '@/api/standings.api'
import type { GroupStandings } from '@/features/matches/types'

const LIVE_REFETCH_MS = 30_000
const IDLE_REFETCH_MS = 5 * 60_000

export interface UseStandingsOptions {
  /** True when any match in view is live → poll fast (30s) instead of 5min. */
  hasLiveMatches: boolean
  /** Gate the fetch so standings only load when their view is shown. */
  enabled?: boolean
}

/**
 * Computed group standings for a tournament
 * (`GET /tournaments/:id/standings`, SCRUM-244 — derived from the matches,
 * server-cached 30s). Server state via TanStack Query — polls every 30s while a
 * match is live and every 5 minutes otherwise. The tournament id lives in the
 * path, so the fetch only runs once it's known.
 */
export function useStandings(
  tournamentId: string | undefined,
  { hasLiveMatches, enabled = true }: UseStandingsOptions,
) {
  return useQuery({
    queryKey: ['standings', tournamentId ?? 'default'],
    queryFn: () =>
      tournamentId
        ? standingsApi.list(tournamentId)
        : Promise.resolve<GroupStandings[]>([]),
    refetchInterval: hasLiveMatches ? LIVE_REFETCH_MS : IDLE_REFETCH_MS,
    enabled: enabled && Boolean(tournamentId),
  })
}
