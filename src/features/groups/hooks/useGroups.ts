import { useQuery } from '@tanstack/react-query'
import { groupsApi } from '@/api/groups.api'

/**
 * The current user's pencas (`GET /groups/me`), general pool first. Server
 * state via TanStack Query; shares the `['groups', ...]` namespace so the
 * create/join mutations (SCRUM-146/147) can invalidate it.
 */
export function useGroups() {
  return useQuery({
    queryKey: ['groups', 'me'],
    queryFn: () => groupsApi.mine(),
  })
}
