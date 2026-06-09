import { useMutation } from '@tanstack/react-query'
import { usersApi, type UpdateProfilePayload } from '@/api/users.api'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

/**
 * Mutation to update the current user's profile (`PATCH /users/me`, SCRUM-199).
 * On success it refetches the auth session so `currentUser` reflects the new
 * username/avatar everywhere. Callers own their own toast + (for the username
 * field) inline error mapping, so the hook stays generic.
 */
export function useUpdateProfile() {
  const { refetch } = useCurrentUser()
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => usersApi.updateProfile(payload),
    onSuccess: () => refetch(),
  })
}
