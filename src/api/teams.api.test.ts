import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { teamsApi } from '@/api/teams.api'

describe('teamsApi.list', () => {
  it('maps the flat array via mapTeam (ignoring extended fields)', async () => {
    server.use(
      http.get('*/teams', () =>
        HttpResponse.json([
          {
            id: 1,
            name: 'Uruguay',
            code3: 'URU',
            flag_url: null,
            external_id: 'x1',
            tournament_id: 1,
          },
          {
            id: 2,
            name: 'Argentina',
            code3: 'ARG',
            flag_url: 'https://f',
            external_id: 'x2',
            tournament_id: 1,
          },
        ]),
      ),
    )

    const teams = await teamsApi.list('1')
    expect(teams).toEqual([
      { id: '1', name: 'Uruguay', code3: 'URU', flagUrl: null },
      { id: '2', name: 'Argentina', code3: 'ARG', flagUrl: 'https://f' },
    ])
  })

  it('passes tournament_id as a flat query param', async () => {
    let captured: URLSearchParams | null = null
    server.use(
      http.get('*/teams', ({ request }) => {
        captured = new URL(request.url).searchParams
        return HttpResponse.json([])
      }),
    )

    await teamsApi.list('7')
    expect(captured!.get('tournament_id')).toBe('7')
  })
})
