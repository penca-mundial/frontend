import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { tournamentPredictionsApi } from '@/api/tournament-predictions.api'
import type { TournamentPredictionResponse } from '@/types/api'

const predictionResponse: TournamentPredictionResponse = {
  id: 5,
  tournament_id: 1,
  champion_id: 9,
  runner_up_id: 3,
  third_place_id: null,
  fourth_place_id: null,
  top_scorer_id: 12,
  locked_at: null,
  locked: false,
}

describe('tournamentPredictionsApi.me', () => {
  it('maps the prediction', async () => {
    server.use(
      http.get('*/tournament_predictions/me', () =>
        HttpResponse.json(predictionResponse),
      ),
    )

    const prediction = await tournamentPredictionsApi.me()
    expect(prediction).toMatchObject({
      id: '5',
      tournamentId: '1',
      championId: '9',
      runnerUpId: '3',
      thirdPlaceId: null,
      topScorerId: '12',
      locked: false,
    })
  })

  it('returns null when the user has no prediction yet', async () => {
    server.use(
      http.get('*/tournament_predictions/me', () => HttpResponse.json(null)),
    )
    expect(await tournamentPredictionsApi.me()).toBeNull()
  })
})

describe('tournamentPredictionsApi.upsert', () => {
  it('PUTs a flat body (not wrapped) and maps the result', async () => {
    let body: unknown = null
    server.use(
      http.put('*/tournament_predictions', async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(predictionResponse)
      }),
    )

    const result = await tournamentPredictionsApi.upsert({
      champion_id: '9',
      top_scorer_id: '12',
    })

    // Flat — not { tournament_prediction: { ... } }.
    expect(body).toEqual({ champion_id: '9', top_scorer_id: '12' })
    expect(result).toMatchObject({ id: '5', championId: '9' })
  })
})
