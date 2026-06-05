import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { rankingsApi } from '@/api/rankings.api'

function entry(rankPosition: number, userId = 9) {
  return {
    user_id: userId,
    username: `u${userId}`,
    avatar_url: null,
    points: 0,
    exact_count: 0,
    rank_position: rankPosition,
  }
}

describe('rankingsApi.groupSlice', () => {
  it('maps entries and the me window to camelCase', async () => {
    server.use(
      http.get('*/rankings/groups/:id', () =>
        HttpResponse.json({
          entries: [entry(1, 9)],
          me: [entry(3, 5), entry(4, 9)],
        }),
      ),
    )

    const slice = await rankingsApi.groupSlice('7')

    expect(slice.entries).toEqual([
      { userId: '9', username: 'u9', points: 0, position: 1 },
    ])
    // me is the window around the user (their row + neighbours).
    expect(slice.me).toEqual([
      { userId: '5', username: 'u5', points: 0, position: 3 },
      { userId: '9', username: 'u9', points: 0, position: 4 },
    ])
  })

  it('returns an empty me window when null', async () => {
    server.use(
      http.get('*/rankings/groups/:id', () =>
        HttpResponse.json({ entries: [], me: null }),
      ),
    )
    expect((await rankingsApi.groupSlice('7')).me).toEqual([])
  })

  it('requests the group with include_me and the smallest page', async () => {
    let params: URLSearchParams | null = null
    let path: string | null = null
    server.use(
      http.get('*/rankings/groups/:id', ({ request }) => {
        const url = new URL(request.url)
        params = url.searchParams
        path = url.pathname
        return HttpResponse.json({ entries: [], me: [] })
      }),
    )

    await rankingsApi.groupSlice('42')

    expect(path).toMatch(/\/rankings\/groups\/42$/)
    expect(params!.get('include_me')).toBe('true')
    expect(params!.get('limit')).toBe('1')
  })
})
