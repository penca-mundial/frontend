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
  /**
   * True → the per-user projected variant
   * (`GET /tournaments/:id/standings/projected`, SCRUM-294): official results
   * blended with the user's predictions. Default false → official tables.
   */
  projected?: boolean
}

/**
 * Computed group standings for a tournament
 * (`GET /tournaments/:id/standings`, SCRUM-244 — derived from the matches,
 * server-cached 30s — or its per-user projected variant, see `projected`).
 * Server state via TanStack Query — polls every 30s while a match is live and
 * every 5 minutes otherwise. The tournament id lives in the path, so the fetch
 * only runs once it's known.
 */
export function useStandings(
  tournamentId: string | undefined,
  { hasLiveMatches, enabled = true, projected = false }: UseStandingsOptions,
) {
  return useQuery({
    queryKey: [
      'standings',
      projected ? 'projected' : 'official',
      tournamentId ?? 'default',
    ],
    queryFn: () =>
      tournamentId
        ? projected
          ? standingsApi.listProjected(tournamentId)
          : standingsApi.list(tournamentId)
        : Promise.resolve<GroupStandings[]>([]),
    refetchInterval: hasLiveMatches ? LIVE_REFETCH_MS : IDLE_REFETCH_MS,
    enabled: enabled && Boolean(tournamentId),
  })
}
