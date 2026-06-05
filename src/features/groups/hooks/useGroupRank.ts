import { useQuery } from '@tanstack/react-query'
import { rankingsApi } from '@/api/rankings.api'

/**
 * The current user's rank within a single group (`GET /rankings/groups/:id`).
 * One query per card — React Query parallelises and caches them under
 * `['rankings', 'group', id, 'me']`. Pre-tournament everyone sits at 0 points
 * → rank 1º; it diverges once matches are scored.
 */
export function useGroupRank(groupId: string) {
  return useQuery({
    queryKey: ['rankings', 'group', groupId, 'me'],
    queryFn: () => rankingsApi.myGroupRank(groupId),
  })
}
