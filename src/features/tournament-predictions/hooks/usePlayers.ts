import { useQuery } from '@tanstack/react-query'
import { playersApi } from '@/api/players.api'

/**
 * The full player list for a tournament (for client-side autocomplete). Only
 * fetches once a tournament id is known; the full-list load lives in the client.
 */
export function usePlayers(tournamentId: string | undefined) {
  return useQuery({
    queryKey: ['players', tournamentId ?? 'current'],
    queryFn: () => playersApi.list(tournamentId),
    enabled: Boolean(tournamentId),
  })
}
