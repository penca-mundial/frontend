import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { scoringApi } from '@/api/scoring.api'

const CONFIG = {
  scoring_rules: [
    { rule_type: 'exact_score', points: 10, label: 'Resultado exacto' },
    { rule_type: 'champion_correct', points: 50, label: 'Campeón acertado' },
    { rule_type: 'top_scorer_correct', points: 25, label: 'Goleador acertado' },
  ],
  phase_multipliers: [
    { phase: 'group_stage', multiplier: 1.0, label: 'Fase de grupos' },
    { phase: 'final', multiplier: 4.0, label: 'Final' },
  ],
}

describe('scoringApi.get', () => {
  it('maps the config to camelCase, preserving order and localized labels', async () => {
    server.use(
      http.get('*/scoring_rules', () => HttpResponse.json(CONFIG)),
    )

    const config = await scoringApi.get()

    expect(config.scoringRules).toEqual([
      { ruleType: 'exact_score', points: 10, label: 'Resultado exacto' },
      { ruleType: 'champion_correct', points: 50, label: 'Campeón acertado' },
      { ruleType: 'top_scorer_correct', points: 25, label: 'Goleador acertado' },
    ])
    expect(config.phaseMultipliers).toEqual([
      { phase: 'group_stage', multiplier: 1, label: 'Fase de grupos' },
      { phase: 'final', multiplier: 4, label: 'Final' },
    ])
  })

  it('hits the public /scoring_rules path', async () => {
    let path: string | null = null
    server.use(
      http.get('*/scoring_rules', ({ request }) => {
        path = new URL(request.url).pathname
        return HttpResponse.json({ scoring_rules: [], phase_multipliers: [] })
      }),
    )

    await scoringApi.get()
    expect(path).toMatch(/\/scoring_rules$/)
  })
})
