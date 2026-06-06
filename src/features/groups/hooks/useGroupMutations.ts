import { useMutation, useQueryClient } from '@tanstack/react-query'
import { groupsApi, type CreateGroupPayload } from '@/api/groups.api'

/** Edit a penca (`PATCH /groups/:id`). Refreshes the detail + the list. */
export function useUpdateGroup(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateGroupPayload) =>
      groupsApi.update(groupId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['group', groupId] })
      void queryClient.invalidateQueries({ queryKey: ['groups', 'me'] })
    },
  })
}

/** Leave a penca (`DELETE /groups/:id/membership`). Refreshes the list. */
export function useLeaveGroup(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => groupsApi.leave(groupId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['groups', 'me'] })
    },
  })
}

/** Delete a penca (`DELETE /groups/:id`, owner). Refreshes the list. */
export function useDeleteGroup(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => groupsApi.remove(groupId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['groups', 'me'] })
    },
  })
}
