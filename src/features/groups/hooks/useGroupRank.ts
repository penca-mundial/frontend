import { useQuery } from '@tanstack/react-query'
import { rankingsApi } from '@/api/rankings.api'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

export interface GroupRank {
  /** The current user's position in this group, or null when unavailable. */
  rankPosition: number | null
  isLoading: boolean
  isError: boolean
}

/**
 * The current user's rank within a single group (`GET /rankings/groups/:id`).
 * One query per card — React Query parallelises and caches them under
 * `['rankings', 'group', id, 'me']`. The `me` window is a slice around the
 * user, so we pick THEIR row by `userId` (never `me[0]`). Pre-tournament
 * everyone sits at 0 points → rank 1º; it diverges once matches are scored.
 */
export function useGroupRank(groupId: string): GroupRank {
  const { currentUser } = useCurrentUser()

  const query = useQuery({
    queryKey: ['rankings', 'group', groupId, 'me'],
    // Only the `me` window is needed per card, so ask for the smallest page.
    queryFn: () =>
      rankingsApi.groupLeaderboard(groupId, { perPage: 1, includeMe: true }),
  })

  // Both ids are strings (the mapper normalises `currentUser.id`, and
  // `entry.userId` is mapped to a string), so a direct compare is safe.
  const myRow = currentUser
    ? query.data?.me.find((entry) => entry.userId === currentUser.id)
    : undefined

  return {
    rankPosition: myRow?.position ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
