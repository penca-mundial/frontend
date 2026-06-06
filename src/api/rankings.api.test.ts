import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { rankingsApi } from '@/api/rankings.api'

function entry(rankPosition: number, userId = 9) {
  return {
    user_id: userId,
    username: `u${userId}`,
    avatar_url: userId === 9 ? 'https://avatars/9.png' : null,
    points: 10 - rankPosition,
    exact_count: rankPosition,
    rank_position: rankPosition,
  }
}

describe('rankingsApi.groupLeaderboard', () => {
  it('maps entries and the me window to camelCase, incl. exactCount + avatarUrl', async () => {
    server.use(
      http.get('*/rankings/groups/:id', () =>
        HttpResponse.json({
          entries: [entry(1, 9)],
          me: [entry(3, 5), entry(4, 9)],
        }),
      ),
    )

    const slice = await rankingsApi.groupLeaderboard('7')

    expect(slice.entries).toEqual([
      {
        userId: '9',
        username: 'u9',
        points: 9,
        position: 1,
        exactCount: 1,
        avatarUrl: 'https://avatars/9.png',
      },
    ])
    expect(slice.me.map((e) => e.userId)).toEqual(['5', '9'])
    expect(slice.me[0]).toMatchObject({ position: 3, exactCount: 3, avatarUrl: null })
  })

  it('returns an empty me window when null', async () => {
    server.use(
      http.get('*/rankings/groups/:id', () =>
        HttpResponse.json({ entries: [], me: null }),
      ),
    )
    expect((await rankingsApi.groupLeaderboard('7')).me).toEqual([])
  })

  it('requests include_me with the given limit at the right path', async () => {
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

    await rankingsApi.groupLeaderboard('42', 100)

    expect(path).toMatch(/\/rankings\/groups\/42$/)
    expect(params!.get('include_me')).toBe('true')
    expect(params!.get('limit')).toBe('100')
  })
})
