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

/** Backend-shaped row (numeric ids, snake_case) for user N at position N. */
function entry(userId: number, rankPosition: number) {
  return {
    user_id: userId,
    username: `u${userId}`,
    avatar_url: null,
    points: 1000 - rankPosition,
    exact_count: 0,
    rank_position: rankPosition,
  }
}

/** Serves /rankings/global paging over `total` ranked users, 25 per page. */
function serveGlobal(total: number) {
  const requests: { page: number; includeMe: boolean; window: string | null }[] =
    []
  server.use(
    http.get('*/rankings/global', ({ request }) => {
      const params = new URL(request.url).searchParams
      const page = Number(params.get('page') ?? 1)
      const perPage = Number(params.get('per_page') ?? 25)
      const includeMe = params.get('include_me') === 'true'
      requests.push({ page, includeMe, window: params.get('window') })

      const start = (page - 1) * perPage
      const slice = Array.from(
        { length: Math.max(0, Math.min(perPage, total - start)) },
        (_, i) => entry(start + i + 1, start + i + 1),
      )
      return HttpResponse.json({
        entries: slice,
        me: includeMe ? [entry(999, 60)] : null,
        page,
        has_more: start + perPage < total,
      })
    }),
  )
  return requests
}

describe('useRanking', () => {
  it('appends the next page on loadMore and keeps me from the first page (AC1/AC4)', async () => {
    const requests = serveGlobal(60)
    const { result } = renderHook(
      () => useRanking({ scope: 'global', window: 'today' }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.entries).toHaveLength(25)
    expect(result.current.entries[0]).toMatchObject({
      userId: '1',
      position: 1,
    })
    expect(result.current.me.map((e) => e.userId)).toEqual(['999'])
    expect(result.current.hasMore).toBe(true)

    result.current.loadMore()
    await waitFor(() => expect(result.current.entries).toHaveLength(50))
    // Appended, not replaced: page 1 rows still lead the list.
    expect(result.current.entries[0].userId).toBe('1')
    expect(result.current.entries[49].userId).toBe('50')
    // include_me travels only on the first page; me stays from page 1.
    expect(requests).toEqual([
      { page: 1, includeMe: true, window: 'today' },
      { page: 2, includeMe: false, window: 'today' },
    ])
    expect(result.current.me.map((e) => e.userId)).toEqual(['999'])
    expect(result.current.hasMore).toBe(true)

    result.current.loadMore()
    await waitFor(() => expect(result.current.entries).toHaveLength(60))
    expect(result.current.hasMore).toBe(false)
  })

  it('reports no more pages for a short leaderboard (AC2)', async () => {
    serveGlobal(3)
    const { result } = renderHook(() => useRanking({ scope: 'global' }), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.entries).toHaveLength(3)
    expect(result.current.hasMore).toBe(false)
  })

  it('paginates the group scope through /rankings/groups/:id, defaulting window=total (AC3)', async () => {
    let url: URL | null = null
    server.use(
      http.get('*/rankings/groups/:id', ({ request }) => {
        url = new URL(request.url)
        return HttpResponse.json({
          entries: [entry(1, 1)],
          me: null,
          page: 1,
          has_more: false,
        })
      }),
    )

    const { result } = renderHook(
      () => useRanking({ scope: { groupId: '7' } }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(url!.pathname).toMatch(/\/rankings\/groups\/7$/)
    expect(url!.searchParams.get('window')).toBe('total')
    expect(result.current.entries).toHaveLength(1)
    // A null `me` (no include_me row yet) maps to an empty array.
    expect(result.current.me).toEqual([])
    expect(result.current.hasMore).toBe(false)
  })
})
