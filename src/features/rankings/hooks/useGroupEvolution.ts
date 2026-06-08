import { useQuery } from '@tanstack/react-query'
import { rankingsApi } from '@/api/rankings.api'

/**
 * A penca's points/rank evolution (`GET /rankings/groups/:id/evolution`,
 * SCRUM-302). Server-cached; the snapshot data only moves once a day's matches
 * finish, so a generous client stale time avoids needless refetches. Shares the
 * `['rankings', 'group', id, ...]` prefix with the other group queries so a
 * single prefix invalidation refreshes them together.
 */
export function useGroupEvolution(groupId: string) {
  return useQuery({
    queryKey: ['rankings', 'group', groupId, 'evolution'],
    queryFn: () => rankingsApi.groupEvolution(groupId),
    staleTime: 5 * 60_000,
    enabled: Boolean(groupId),
  })
}
