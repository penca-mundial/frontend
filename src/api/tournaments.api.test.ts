import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { tournamentsApi } from '@/api/tournaments.api'

describe('tournamentsApi.current', () => {
  it('maps the tournament incl. lock + countdown and string ids', async () => {
    server.use(
      http.get('*/tournaments/current', () =>
        HttpResponse.json({
          id: 1,
          name: 'Mundial 2026',
          starts_at: '2026-06-11T00:00:00Z',
          ends_at: null,
          external_code: 'WC2026',
          champion_id: 9,
          runner_up_id: null,
          third_place_id: null,
          fourth_place_id: null,
          top_scorer_id: null,
          is_locked: false,
          seconds_until_kickoff: 3600,
        }),
      ),
    )

    const tournament = await tournamentsApi.current()
    expect(tournament).toMatchObject({
      id: '1',
      name: 'Mundial 2026',
      startsAt: '2026-06-11T00:00:00Z',
      endsAt: null,
      externalCode: 'WC2026',
      championId: '9',
      runnerUpId: null,
      isLocked: false,
      secondsUntilKickoff: 3600,
    })
  })
})
