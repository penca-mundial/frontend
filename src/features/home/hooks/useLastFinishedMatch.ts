import { useQuery } from '@tanstack/react-query'
import { matchesApi } from '@/api/matches.api'
import type { Match } from '@/features/matches/types'

export interface LastFinishedMatch {
  match: Match | null
  isLoading: boolean
}

/**
 * The most recently finished match (`GET /matches/last_finished`) with the
 * user's prediction, for the "Último resultado" card. Fetched once; degrades to
 * null until the backend endpoint ships (backend gap A/B).
 */
export function useLastFinishedMatch(): LastFinishedMatch {
  const query = useQuery({
    queryKey: ['matches', 'lastFinished'],
    queryFn: () => matchesApi.lastFinished(),
  })

  return { match: query.data ?? null, isLoading: query.isLoading }
}
