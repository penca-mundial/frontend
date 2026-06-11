import { useQuery } from '@tanstack/react-query'
import { matchesApi } from '@/api/matches.api'
import type { Match } from '@/features/matches/types'

export interface RecentFinishedMatches {
  /** Up to 3 finished matches, most recent first (empty until any finish). */
  matches: Match[]
  isLoading: boolean
}

/**
 * The last few finished matches (`GET /matches/recent_finished`, up to 3, most
 * recent first), each with the user's prediction + points, for the dashboard's
 * result cards. Degrades to an empty list until the endpoint ships.
 */
export function useRecentFinishedMatches(): RecentFinishedMatches {
  const query = useQuery({
    queryKey: ['matches', 'recentFinished'],
    queryFn: () => matchesApi.recentFinished(),
  })

  return { matches: query.data ?? [], isLoading: query.isLoading }
}
