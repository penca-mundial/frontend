import { useMutation, useQueryClient } from '@tanstack/react-query'
import { groupsApi, type CreateGroupPayload } from '@/api/groups.api'

/**
 * Create a penca (`POST /groups`). On success it invalidates `['groups', 'me']`
 * so the list refetches and shows the new penca (with its code). Navigation and
 * the success toast live in the form, which owns `useNavigate`.
 */
export function useCreateGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateGroupPayload) => groupsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['groups', 'me'] })
    },
  })
}
