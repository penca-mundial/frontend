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

/** Paginated body as the backend renders it (SCRUM-280). */
function body(overrides: Partial<Record<string, unknown>> = {}) {
  return { entries: [], me: null, page: 1, has_more: false, ...overrides }
}

describe('rankingsApi.groupLeaderboard', () => {
  it('maps entries, the me window and pagination to camelCase', async () => {
    server.use(
      http.get('*/rankings/groups/:id', () =>
        HttpResponse.json(
          body({
            entries: [entry(1, 9)],
            me: [entry(3, 5), entry(4, 9)],
            page: 1,
            has_more: true,
          }),
        ),
      ),
    )

    const slice = await rankingsApi.groupLeaderboard('7', { includeMe: true })

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
    expect(slice.page).toBe(1)
    expect(slice.hasMore).toBe(true)
  })

  it('returns an empty me window when null', async () => {
    server.use(
      http.get('*/rankings/groups/:id', () => HttpResponse.json(body())),
    )
    expect((await rankingsApi.groupLeaderboard('7')).me).toEqual([])
  })

  it('requests 1-based page/per_page at the right path, defaulting window=total', async () => {
    let params: URLSearchParams | null = null
    let path: string | null = null
    server.use(
      http.get('*/rankings/groups/:id', ({ request }) => {
        const url = new URL(request.url)
        params = url.searchParams
        path = url.pathname
        return HttpResponse.json(body())
      }),
    )

    await rankingsApi.groupLeaderboard('42', { page: 3 })

    expect(path).toMatch(/\/rankings\/groups\/42$/)
    expect(params!.get('page')).toBe('3')
    expect(params!.get('per_page')).toBe('25')
    expect(params!.get('window')).toBe('total')
    // include_me only travels when explicitly requested (page 1 use-case).
    expect(params!.get('include_me')).toBeNull()
  })

  it('passes window and include_me when requested', async () => {
    let params: URLSearchParams | null = null
    server.use(
      http.get('*/rankings/groups/:id', ({ request }) => {
        params = new URL(request.url).searchParams
        return HttpResponse.json(body())
      }),
    )

    await rankingsApi.groupLeaderboard('42', {
      window: 'week',
      includeMe: true,
      perPage: 1,
    })

    expect(params!.get('window')).toBe('week')
    expect(params!.get('include_me')).toBe('true')
    expect(params!.get('per_page')).toBe('1')
  })
})

describe('rankingsApi.groupEvolution', () => {
  it('maps the evolution payload to camelCase with string ids (ADR 0004)', async () => {
    server.use(
      http.get('*/rankings/groups/:id/evolution', () =>
        HttpResponse.json({
          available: true,
          lines: [
            {
              user: { id: 9, username: 'santi', avatar_url: 'https://a/9.png' },
              series: [
                { date: '2026-06-12', points: 7, rank: 3 },
                { date: '2026-06-13', points: 13, rank: 1 },
              ],
            },
          ],
        }),
      ),
    )

    const result = await rankingsApi.groupEvolution('7')

    expect(result.available).toBe(true)
    expect(result.lines).toEqual([
      {
        userId: '9',
        username: 'santi',
        avatarUrl: 'https://a/9.png',
        series: [
          { date: '2026-06-12', points: 7, rank: 3 },
          { date: '2026-06-13', points: 13, rank: 1 },
        ],
      },
    ])
  })

  it('hits the group evolution path and maps the empty/gated payload', async () => {
    let path: string | null = null
    server.use(
      http.get('*/rankings/groups/:id/evolution', ({ request }) => {
        path = new URL(request.url).pathname
        return HttpResponse.json({ available: false, lines: [] })
      }),
    )

    const result = await rankingsApi.groupEvolution('42')
    expect(path).toMatch(/\/rankings\/groups\/42\/evolution$/)
    expect(result).toEqual({ available: false, lines: [] })
  })
})

describe('rankingsApi.global', () => {
  it('maps the page from /rankings/global with the same camelCase shape', async () => {
    let params: URLSearchParams | null = null
    let path: string | null = null
    server.use(
      http.get('*/rankings/global', ({ request }) => {
        const url = new URL(request.url)
        params = url.searchParams
        path = url.pathname
        return HttpResponse.json(
          body({
            entries: [entry(1, 9)],
            me: [entry(12, 5)],
            page: 2,
            has_more: false,
          }),
        )
      }),
    )

    const slice = await rankingsApi.global({
      page: 2,
      window: 'today',
      includeMe: true,
    })

    expect(path).toMatch(/\/rankings\/global$/)
    expect(params!.get('page')).toBe('2')
    expect(params!.get('include_me')).toBe('true')
    expect(params!.get('window')).toBe('today')
    expect(slice.entries[0]).toMatchObject({ userId: '9', position: 1 })
    expect(slice.me[0]).toMatchObject({ userId: '5', position: 12 })
    expect(slice.page).toBe(2)
    expect(slice.hasMore).toBe(false)
  })

  it('returns an empty me window when null', async () => {
    server.use(
      http.get('*/rankings/global', () => HttpResponse.json(body())),
    )
    expect((await rankingsApi.global()).me).toEqual([])
  })
})
