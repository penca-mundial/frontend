import { useQuery } from '@tanstack/react-query'
import { rankingsApi } from '@/api/rankings.api'

/**
 * A group's full leaderboard for the detail page (top 100 + the `me` window),
 * cached under `['rankings', 'group', id, 'leaderboard']` — separate from the
 * per-card `useGroupRank` (which only fetches the `me` slice).
 */
export function useGroupLeaderboard(groupId: string) {
  return useQuery({
    queryKey: ['rankings', 'group', groupId, 'leaderboard'],
    queryFn: () => rankingsApi.groupLeaderboard(groupId, 100),
    enabled: Boolean(groupId),
  })
}
