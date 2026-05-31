import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { matchesApi } from '@/api/matches.api'
import type { MatchResponse } from '@/types/api'

const matchResponse: MatchResponse = {
  id: 10,
  external_id: 'ext-10',
  tournament_id: 1,
  kickoff_at: '2026-06-12T19:00:00Z',
  status: 'scheduled',
  phase: 'group_stage',
  home_score: null,
  away_score: null,
  advancing_team_id: null,
  home_team: { id: 1, name: 'Uruguay', code3: 'URU', flag_url: null },
  away_team: { id: 2, name: 'Argentina', code3: 'ARG', flag_url: null },
}

describe('matchesApi.list', () => {
  it('maps the array body and reads the total from X-Total-Count', async () => {
    server.use(
      http.get('*/matches', () =>
        HttpResponse.json([matchResponse], {
          headers: { 'X-Total-Count': '72' },
        }),
      ),
    )

    const result = await matchesApi.list()
    expect(result.totalCount).toBe(72)
    expect(result.matches).toHaveLength(1)
    expect(result.matches[0]).toMatchObject({
      id: '10',
      tournamentId: '1',
      phase: 'group_stage',
      homeTeam: { id: '1', name: 'Uruguay', code3: 'URU' },
      awayTeam: { id: '2', name: 'Argentina' },
    })
  })

  it('passes filters and pagination as query params', async () => {
    let captured: URLSearchParams | null = null
    server.use(
      http.get('*/matches', ({ request }) => {
        captured = new URL(request.url).searchParams
        return HttpResponse.json([])
      }),
    )

    await matchesApi.list(
      { phase: 'round_of_32', dateFrom: '2026-06-01', teamId: '3' },
      2,
      25,
    )

    expect(captured!.get('phase')).toBe('round_of_32')
    expect(captured!.get('date_from')).toBe('2026-06-01')
    expect(captured!.get('team_id')).toBe('3')
    expect(captured!.get('page')).toBe('2')
    expect(captured!.get('per_page')).toBe('25')
  })
})

describe('matchesApi.get', () => {
  it('maps a single match including the user prediction', async () => {
    server.use(
      http.get('*/matches/10', () =>
        HttpResponse.json({
          ...matchResponse,
          my_prediction: {
            id: 5,
            match_id: 10,
            predicted_home_score: 2,
            predicted_away_score: 1,
            predicted_advancing_team_id: null,
            locked_at: null,
            locked: false,
          },
        }),
      ),
    )

    const match = await matchesApi.get('10')
    expect(match.id).toBe('10')
    expect(match.myPrediction).toMatchObject({
      id: '5',
      matchId: '10',
      predictedHomeScore: 2,
      predictedAwayScore: 1,
    })
  })
})
