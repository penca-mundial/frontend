import { useQuery } from '@tanstack/react-query'
import { teamsApi } from '@/api/teams.api'

/** Teams for a tournament; only fetches once a tournament id is known. */
export function useTeams(tournamentId: string | undefined) {
  return useQuery({
    queryKey: ['teams', tournamentId ?? 'current'],
    queryFn: () => teamsApi.list(tournamentId),
    enabled: Boolean(tournamentId),
  })
}
