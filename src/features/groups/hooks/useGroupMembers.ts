import { useInfiniteQuery } from '@tanstack/react-query'
import { groupsApi } from '@/api/groups.api'

/**
 * A penca's members (`GET /groups/:id/members`), paginated. Uses an infinite
 * query so "Ver más" appends the next page; `getNextPageParam` stops once every
 * member (per `X-Total-Count`) is loaded.
 */
export function useGroupMembers(groupId: string) {
  return useInfiniteQuery({
    queryKey: ['group', groupId, 'members'],
    queryFn: ({ pageParam }) => groupsApi.members(groupId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.perPage
      return loaded < lastPage.totalCount ? lastPage.page + 1 : undefined
    },
    enabled: Boolean(groupId),
  })
}
