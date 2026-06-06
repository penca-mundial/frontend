import { useQuery } from '@tanstack/react-query'
import { groupsApi } from '@/api/groups.api'

/** A single penca by id (`GET /groups/:id`). Cached under `['group', id]`. */
export function useGroup(groupId: string) {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupsApi.get(groupId),
    enabled: Boolean(groupId),
  })
}
