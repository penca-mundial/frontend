import { useInfiniteQuery } from '@tanstack/react-query'
import { userProfilesApi } from '@/api/userProfiles.api'

const PER_PAGE = 10

/**
 * The viewed user's locked match picks (`GET /users/:id/predictions`),
 * paginated with `has_more`. Live match first, then finished by kickoff desc.
 */
export function useUserPredictions(userId: string) {
  return useInfiniteQuery({
    queryKey: ['user-profile', userId, 'predictions'],
    queryFn: ({ pageParam }) =>
      userProfilesApi.predictions(userId, pageParam, PER_PAGE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: Boolean(userId),
  })
}
