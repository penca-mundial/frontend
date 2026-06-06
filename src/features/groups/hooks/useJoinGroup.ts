import { useMutation, useQueryClient } from '@tanstack/react-query'
import { groupsApi } from '@/api/groups.api'

/**
 * Join a penca by code (`POST /groups/join`). On success it invalidates
 * `['groups', 'me']` so the list refetches with the joined penca. Navigation
 * and the success toast live in the form (which owns `useNavigate` and the
 * group name returned by the mutation).
 */
export function useJoinGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (code: string) => groupsApi.join(code),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['groups', 'me'] })
    },
  })
}
