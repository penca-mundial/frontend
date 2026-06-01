import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { playersApi } from '@/api/players.api'
import type { PlayerResponse } from '@/types/api'

function player(id: number): PlayerResponse {
  return {
    id,
    name: `Player ${id}`,
    external_id: `e${id}`,
    team_id: 1,
    team: { id: 1, name: 'Uruguay', code3: 'URU', flag_url: null },
  }
}

describe('playersApi.list', () => {
  it('loads the full list, sized by X-Total-Count (probe + full fetch)', async () => {
    const all = [player(1), player(2), player(3)]
    const perPages: number[] = []
    server.use(
      http.get('*/players', ({ request }) => {
        const perPage = Number(
          new URL(request.url).searchParams.get('per_page'),
        )
        perPages.push(perPage)
        return HttpResponse.json(all.slice(0, perPage), {
          headers: { 'X-Total-Count': '3' },
        })
      }),
    )

    const players = await playersApi.list('1')

    expect(players).toHaveLength(3)
    expect(perPages).toEqual([1, 3]) // probe (1), then a full fetch sized by total
    expect(players[0]).toMatchObject({
      id: '1',
      name: 'Player 1',
      externalId: 'e1',
      teamId: '1',
      team: { id: '1', code3: 'URU' },
    })
  })

  it('does a single fetch when the whole list fits the probe', async () => {
    let calls = 0
    server.use(
      http.get('*/players', () => {
        calls += 1
        return HttpResponse.json([player(1)], {
          headers: { 'X-Total-Count': '1' },
        })
      }),
    )

    const players = await playersApi.list('1')
    expect(players).toHaveLength(1)
    expect(calls).toBe(1)
  })
})
