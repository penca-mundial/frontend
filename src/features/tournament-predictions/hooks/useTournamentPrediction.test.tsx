import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import type { ReactNode } from 'react'
import { server } from '@/test/mocks/server'
import { useTournamentPrediction } from '@/features/tournament-predictions/hooks/useTournamentPrediction'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

function prediction(championId: number | null) {
  return {
    id: 5,
    tournament_id: 1,
    champion_id: championId,
    runner_up_id: null,
    third_place_id: null,
    fourth_place_id: null,
    top_scorer_id: null,
    locked_at: null,
    locked: false,
  }
}

describe('useTournamentPrediction', () => {
  it('reads me() and refetches it after a successful upsert', async () => {
    let saved: number | null = null // server-side "state"
    server.use(
      http.get('*/tournament_predictions/me', () =>
        HttpResponse.json(saved === null ? null : prediction(saved)),
      ),
      http.put('*/tournament_predictions', async ({ request }) => {
        const body = (await request.json()) as { champion_id?: string }
        saved = Number(body.champion_id)
        return HttpResponse.json(prediction(saved))
      }),
    )

    const { result } = renderHook(() => useTournamentPrediction(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true))
    expect(result.current.query.data).toBeNull()

    await act(async () => {
      await result.current.upsert.mutateAsync({ champion_id: '9' })
    })

    // The invalidation re-runs me(), which now returns the saved prediction.
    await waitFor(() =>
      expect(result.current.query.data?.championId).toBe('9'),
    )
  })
})
