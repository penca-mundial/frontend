import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { standingsApi } from '@/api/standings.api'
import type { StandingResponse } from '@/types/api'

function row(overrides: Partial<StandingResponse>): StandingResponse {
  return {
    id: 1,
    group: 'A',
    position: 1,
    played_games: 1,
    won: 1,
    draw: 0,
    lost: 0,
    goals_for: 3,
    goals_against: 1,
    goal_difference: 2,
    points: 3,
    form: 'W',
    team: { id: 1, name: 'Uruguay', code3: 'URU', flag_url: null },
    ...overrides,
  }
}

describe('standingsApi.list', () => {
  it('maps the grouped envelope to camelCase and sorts groups alphabetically', async () => {
    server.use(
      http.get('*/standings', () =>
        HttpResponse.json({
          groups: {
            B: [row({ id: 3, group: 'B', team: { id: 5, name: 'Brasil', code3: 'BRA', flag_url: null } })],
            A: [row({ id: 1, group: 'A' })],
          },
        }),
      ),
    )

    const result = await standingsApi.list('1')

    expect(result.map((g) => g.group)).toEqual(['A', 'B']) // sorted
    expect(result[0]).toMatchObject({
      group: 'A',
      rows: [
        {
          id: '1',
          position: 1,
          playedGames: 1,
          goalDifference: 2,
          points: 3,
          team: { id: '1', name: 'Uruguay', code3: 'URU' },
        },
      ],
    })
  })

  it('passes tournament_id as a flat query param', async () => {
    let captured: URLSearchParams | null = null
    server.use(
      http.get('*/standings', ({ request }) => {
        captured = new URL(request.url).searchParams
        return HttpResponse.json({ groups: {} })
      }),
    )

    await standingsApi.list('7')
    expect(captured!.get('tournament_id')).toBe('7')
  })

  it('returns an empty array when there are no groups', async () => {
    server.use(http.get('*/standings', () => HttpResponse.json({ groups: {} })))
    expect(await standingsApi.list()).toEqual([])
  })
})
