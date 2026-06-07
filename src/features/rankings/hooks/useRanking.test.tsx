import { type ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { useRanking } from '@/features/rankings/hooks/useRanking'

function Wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

// Production-shaped payload: numeric ids, snake_case keys.
const WIRE_ENTRY = {
  user_id: 9,
  username: 'santi',
  avatar_url: null,
  points: 35,
  exact_count: 4,
  rank_position: 12,
}

describe('useRanking', () => {
  it('fetches the global endpoint with the window and maps ids to strings', async () => {
    let url: URL | null = null
    server.use(
      http.get('*/rankings/global', ({ request }) => {
        url = new URL(request.url)
        return HttpResponse.json({ entries: [WIRE_ENTRY], me: [WIRE_ENTRY] })
      }),
    )

    const { result } = renderHook(
      () => useRanking({ scope: 'global', window: 'today' }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(url!.searchParams.get('window')).toBe('today')
    expect(url!.searchParams.get('include_me')).toBe('true')
    expect(result.current.data?.entries[0]).toMatchObject({
      userId: '9',
      position: 12,
      points: 35,
    })
  })

  it('fetches the group endpoint for a group scope, defaulting to the total window', async () => {
    let url: URL | null = null
    server.use(
      http.get('*/rankings/groups/:id', ({ request }) => {
        url = new URL(request.url)
        return HttpResponse.json({ entries: [], me: null })
      }),
    )

    const { result } = renderHook(
      () => useRanking({ scope: { groupId: '7' } }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(url!.pathname).toMatch(/\/rankings\/groups\/7$/)
    expect(url!.searchParams.get('window')).toBe('total')
    // A null `me` (no include_me row yet) maps to an empty array.
    expect(result.current.data?.me).toEqual([])
  })
})
