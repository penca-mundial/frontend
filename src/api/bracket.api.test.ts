import { describe, expect, it } from 'vitest'
import { mapBracketMatch } from '@/api/bracket.api'
import type { BracketMatchResponse } from '@/types/api'

// Production-shaped payload: numeric ids from the backend, normalised at the
// boundary (ADR 0004). Mirrors the real GET /tournaments/:id/bracket entry.
function response(
  overrides: Partial<BracketMatchResponse> = {},
): BracketMatchResponse {
  return {
    id: 114,
    external_id: 'demo-qf0',
    tournament_id: 2,
    kickoff_at: '2026-06-20T17:39:20Z',
    status: 'finished',
    phase: 'quarter_final',
    group: null,
    minute: null,
    home_score: 1,
    away_score: 0,
    advancing_team_id: 79,
    home_team: { id: 79, name: 'A1', code3: 'DA1', flag_url: null },
    away_team: { id: 84, name: 'B2', code3: 'DB2', flag_url: null },
    feeds_into_match_id: 122,
    feeds_into_slot: 'home',
    bracket_position: 0,
    my_prediction: null,
    ...overrides,
  }
}

describe('mapBracketMatch', () => {
  it('normalises ids and topology to the domain shape', () => {
    const match = mapBracketMatch(response())

    expect(match.id).toBe('114')
    expect(match.advancingTeamId).toBe('79')
    expect(match.homeTeam).toEqual({
      id: '79',
      name: 'A1',
      code3: 'DA1',
      flagUrl: null,
    })
    expect(match.feedsIntoMatchId).toBe('122')
    expect(match.feedsIntoSlot).toBe('home')
    expect(match.bracketPosition).toBe(0)
  })

  it('keeps null topology for the sinks (final / third place)', () => {
    const match = mapBracketMatch(
      response({
        phase: 'final',
        feeds_into_match_id: null,
        feeds_into_slot: null,
        advancing_team_id: null,
      }),
    )
    expect(match.feedsIntoMatchId).toBeNull()
    expect(match.feedsIntoSlot).toBeNull()
    expect(match.advancingTeamId).toBeNull()
  })

  it('maps the gated pick (advance pick + points_earned), null when absent', () => {
    expect(mapBracketMatch(response()).myPrediction).toBeNull()

    const withPick = mapBracketMatch(
      response({
        my_prediction: {
          id: 19,
          match_id: 114,
          predicted_home_score: 1,
          predicted_away_score: 0,
          predicted_advancing_team_id: 79,
          locked_at: null,
          locked: true,
          points_earned: 5,
        },
      }),
    )
    expect(withPick.myPrediction).toEqual({
      id: '19',
      matchId: '114',
      predictedHomeScore: 1,
      predictedAwayScore: 0,
      predictedAdvancingTeamId: '79',
      locked: true,
      pointsEarned: 5,
    })
  })
})
