import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { predictionsApi } from '@/api/predictions.api'

/**
 * Fetch the current user's predictions (`GET /predictions/me`, paginated).
 * Shares the `['predictions', ...]` namespace invalidated after an upsert and
 * keeps the previous page while a new one loads.
 */
export function usePredictions(page = 1, perPage = 20) {
  return useQuery({
    queryKey: ['predictions', page, perPage],
    queryFn: () => predictionsApi.list(page, perPage),
    placeholderData: keepPreviousData,
  })
}
