import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { predictionsApi } from '@/api/predictions.api'
import type { PredictionResponse } from '@/types/api'

const predictionResponse: PredictionResponse = {
  id: 5,
  match_id: 10,
  predicted_home_score: 2,
  predicted_away_score: 1,
  predicted_advancing_team_id: null,
  locked_at: null,
  locked: true,
}

describe('predictionsApi.list', () => {
  it('maps the array and reads the total from X-Total-Count', async () => {
    server.use(
      http.get('*/predictions/me', () =>
        HttpResponse.json([predictionResponse], {
          headers: { 'X-Total-Count': '3' },
        }),
      ),
    )

    const result = await predictionsApi.list()
    expect(result.totalCount).toBe(3)
    expect(result.predictions[0]).toMatchObject({
      id: '5',
      matchId: '10',
      predictedHomeScore: 2,
      predictedAwayScore: 1,
      locked: true,
    })
  })

  it('passes pagination params', async () => {
    let captured: URLSearchParams | null = null
    server.use(
      http.get('*/predictions/me', ({ request }) => {
        captured = new URL(request.url).searchParams
        return HttpResponse.json([])
      }),
    )

    await predictionsApi.list(2, 25)
    expect(captured!.get('page')).toBe('2')
    expect(captured!.get('per_page')).toBe('25')
  })
})

describe('predictionsApi.upsert', () => {
  it('PUTs the payload and maps the result', async () => {
    server.use(
      http.put('*/predictions', async ({ request }) => {
        expect(await request.json()).toMatchObject({ match_id: '10' })
        return HttpResponse.json(predictionResponse)
      }),
    )

    const prediction = await predictionsApi.upsert({
      match_id: '10',
      predicted_home_score: 2,
      predicted_away_score: 1,
    })
    expect(prediction).toMatchObject({ id: '5', matchId: '10' })
  })
})
