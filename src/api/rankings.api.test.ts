import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { rankingsApi } from '@/api/rankings.api'

function entry(rankPosition: number) {
  return {
    user_id: 9,
    username: 'santi',
    avatar_url: null,
    points: 0,
    exact_count: 0,
    rank_position: rankPosition,
  }
}

describe('rankingsApi.myGroupRank', () => {
  it('reads rank_position from the "me" slice', async () => {
    server.use(
      http.get('*/rankings/groups/:id', () =>
        HttpResponse.json({ entries: [entry(5)], me: entry(5) }),
      ),
    )
    expect(await rankingsApi.myGroupRank('7')).toEqual({ rankPosition: 5 })
  })

  it('returns null when there is no "me" row yet', async () => {
    server.use(
      http.get('*/rankings/groups/:id', () =>
        HttpResponse.json({ entries: [], me: null }),
      ),
    )
    expect(await rankingsApi.myGroupRank('7')).toBeNull()
  })

  it('requests the group with include_me and the smallest page', async () => {
    let captured: URLSearchParams | null = null
    let capturedPath: string | null = null
    server.use(
      http.get('*/rankings/groups/:id', ({ request }) => {
        const url = new URL(request.url)
        captured = url.searchParams
        capturedPath = url.pathname
        return HttpResponse.json({ entries: [], me: entry(1) })
      }),
    )

    await rankingsApi.myGroupRank('42')

    expect(capturedPath).toMatch(/\/rankings\/groups\/42$/)
    expect(captured!.get('include_me')).toBe('true')
    expect(captured!.get('limit')).toBe('1')
  })
})
