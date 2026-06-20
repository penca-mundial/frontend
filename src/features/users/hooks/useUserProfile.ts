import { useQuery } from '@tanstack/react-query'
import { userProfilesApi } from '@/api/userProfiles.api'

/** The viewed user's public profile (`GET /users/:id/profile`). */
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => userProfilesApi.profile(userId),
    enabled: Boolean(userId),
  })
}
