import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { standingsApi } from '@/api/standings.api'
import type { ComputedGroupStandings, ComputedStandingRow } from '@/types/api'

function row(overrides: Partial<ComputedStandingRow>): ComputedStandingRow {
  return {
    team: { id: 1, name: 'Uruguay', code3: 'URU', flag_url: null },
    position: 1,
    played: 1,
    won: 1,
    drawn: 0,
    lost: 0,
    goals_for: 3,
    goals_against: 1,
    goal_difference: 2,
    points: 3,
    ...overrides,
  }
}

function group(
  name: string,
  rows: ComputedStandingRow[],
): ComputedGroupStandings {
  return { name, standings: rows }
}

describe('standingsApi.list', () => {
  it('maps the computed array to camelCase, sorts groups, keeps row order', async () => {
    server.use(
      http.get('*/tournaments/:id/standings', () =>
        HttpResponse.json([
          group('B', [
            row({
              position: 1,
              team: { id: 5, name: 'Brasil', code3: 'BRA', flag_url: null },
            }),
          ]),
          group('A', [
            row({ position: 1, points: 7, goal_difference: 4 }),
            row({
              position: 2,
              points: 1,
              drawn: 1,
              won: 0,
              played: 1,
              goal_difference: -2,
              team: { id: 2, name: 'Argentina', code3: 'ARG', flag_url: null },
            }),
          ]),
        ]),
      ),
    )

    const result = await standingsApi.list('1')

    expect(result.map((g) => g.group)).toEqual(['A', 'B']) // sorted by name
    // Row order within the group is preserved (backend already ordered it).
    expect(result[0].rows.map((r) => r.position)).toEqual([1, 2])
    expect(result[0].rows[0]).toMatchObject({
      group: 'A',
      position: 1,
      playedGames: 1,
      won: 1,
      draw: 0, // drawn -> draw
      goalDifference: 4,
      points: 7,
      form: null,
      team: { id: '1', name: 'Uruguay', code3: 'URU' },
    })
    // Synthesized stable key from group + team id (the endpoint has no row id).
    expect(result[0].rows[0].id).toBe('A-1')
    expect(result[0].rows[1].draw).toBe(1)
  })

  it('hits the computed path with the tournament id', async () => {
    let capturedPath: string | null = null
    server.use(
      http.get('*/tournaments/:id/standings', ({ request }) => {
        capturedPath = new URL(request.url).pathname
        return HttpResponse.json([])
      }),
    )

    await standingsApi.list('7')
    expect(capturedPath).toMatch(/\/tournaments\/7\/standings$/)
  })

  it('maps pre-tournament groups with every stat at 0 (teams present)', async () => {
    server.use(
      http.get('*/tournaments/:id/standings', () =>
        HttpResponse.json([
          group('A', [
            row({
              position: 1,
              played: 0,
              won: 0,
              drawn: 0,
              lost: 0,
              goals_for: 0,
              goals_against: 0,
              goal_difference: 0,
              points: 0,
            }),
          ]),
        ]),
      ),
    )

    const result = await standingsApi.list('1')

    expect(result).toHaveLength(1)
    expect(result[0].rows[0]).toMatchObject({
      playedGames: 0,
      points: 0,
      goalDifference: 0,
      team: { name: 'Uruguay' },
    })
  })

  it('returns an empty array when the endpoint has no groups', async () => {
    server.use(
      http.get('*/tournaments/:id/standings', () => HttpResponse.json([])),
    )
    expect(await standingsApi.list('1')).toEqual([])
  })
})

describe('standingsApi.listProjected', () => {
  it('hits the projected path with the tournament id', async () => {
    let capturedPath: string | null = null
    server.use(
      http.get('*/tournaments/:id/standings/projected', ({ request }) => {
        capturedPath = new URL(request.url).pathname
        return HttpResponse.json([])
      }),
    )

    await standingsApi.listProjected('7')
    expect(capturedPath).toMatch(/\/tournaments\/7\/standings\/projected$/)
  })

  it('maps the blended rows: official played/won/drawn/lost with projected points', async () => {
    // The hybrid the backend produces pre-match: nothing played officially,
    // but the user's predictions already project points and positions.
    server.use(
      http.get('*/tournaments/:id/standings/projected', () =>
        HttpResponse.json([
          group('A', [
            row({
              position: 1,
              played: 0,
              won: 0,
              drawn: 0,
              lost: 0,
              goals_for: 2,
              goals_against: 0,
              goal_difference: 2,
              points: 3,
            }),
          ]),
        ]),
      ),
    )

    const result = await standingsApi.listProjected('1')

    expect(result).toHaveLength(1)
    expect(result[0].rows[0]).toMatchObject({
      playedGames: 0, // official
      won: 0,
      draw: 0,
      lost: 0,
      points: 3, // projected
      goalDifference: 2,
      position: 1,
      team: { id: '1', name: 'Uruguay' },
    })
    expect(result[0].rows[0].id).toBe('A-1')
  })

  it('sorts groups alphabetically like the official variant', async () => {
    server.use(
      http.get('*/tournaments/:id/standings/projected', () =>
        HttpResponse.json([group('B', [row({})]), group('A', [row({})])]),
      ),
    )
    const result = await standingsApi.listProjected('1')
    expect(result.map((g) => g.group)).toEqual(['A', 'B'])
  })
})
