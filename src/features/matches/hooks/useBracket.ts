import { useQuery } from '@tanstack/react-query'
import { bracketApi } from '@/api/bracket.api'

/**
 * The knockout bracket for a tournament (`GET /tournaments/:id/bracket`).
 * Disabled until the tournament id is known; `enabled` lets the caller defer the
 * fetch until the bracket view is actually shown.
 */
export function useBracket(
  tournamentId: string | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['bracket', tournamentId],
    queryFn: () => bracketApi.get(tournamentId as string),
    enabled: Boolean(tournamentId) && (options?.enabled ?? true),
  })
}
