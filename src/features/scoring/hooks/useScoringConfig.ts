import { useQuery } from '@tanstack/react-query'
import { scoringApi } from '@/api/scoring.api'

/**
 * The scoring configuration (`GET /scoring_rules`, SCRUM-296). Shared by the
 * in-app rules page and the public landing table so both render from one
 * source of truth. The config changes rarely (admin-edited) and the backend
 * caches it 30s, so a long client stale time avoids needless refetches.
 */
export function useScoringConfig() {
  return useQuery({
    queryKey: ['scoring-config'],
    queryFn: () => scoringApi.get(),
    staleTime: 5 * 60_000,
  })
}
