import { useQuery } from '@tanstack/react-query'
import { bracketApi } from '@/api/bracket.api'

/**
 * The projected Round-of-32 for the signed-in viewer
 * (`GET /tournaments/:id/bracket/projected`, authed). The caller gates `enabled`
 * to authenticated users only (anonymous viewers get the official bracket).
 */
export function useProjectedBracket(
  tournamentId: string | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['bracket', 'projected', tournamentId],
    queryFn: () => bracketApi.getProjected(tournamentId as string),
    enabled: Boolean(tournamentId) && (options?.enabled ?? true),
  })
}
