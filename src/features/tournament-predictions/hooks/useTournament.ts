import { useQuery } from '@tanstack/react-query'
import { tournamentsApi } from '@/api/tournaments.api'

/** The current tournament (`GET /tournaments/current`), incl. lock + countdown. */
export function useTournament() {
  return useQuery({
    queryKey: ['tournament', 'current'],
    queryFn: () => tournamentsApi.current(),
  })
}
