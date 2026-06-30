import { describe, expect, it } from 'vitest'
import {
  mapUserPredictionsPage,
  mapUserProfile,
} from '@/api/userProfiles.api'
import type {
  UserPredictionsResponse,
  UserProfileResponse,
} from '@/types/api'

// Production-shaped payloads: numeric ids from the backend (the boundary is the
// only place String(id) normalisation happens — ADR 0004).
function profileResponse(
  overrides: Partial<UserProfileResponse> = {},
): UserProfileResponse {
  return {
    user: { id: 42, username: 'leo', avatar_url: 'http://x/leo.png' },
    global_ranking: {
      rank_position: 7,
      points: 31,
      exact_count: 4,
      total: 128,
    },
    shared_groups: [
      {
        group: { id: 1, name: 'Pool General', is_general_pool: true },
        rank_position: 7,
        points: 31,
        total: 128,
      },
      {
        group: { id: 5, name: 'Los Amigos', is_general_pool: false },
        rank_position: 2,
        points: 31,
        total: 9,
      },
    ],
    tournament_prediction: { available: false, reason: 'tournament_not_started' },
    stats: {
      exact: 4,
      correct_winner: 3,
      goal_difference: 2,
      missed: 5,
      total: 14,
    },
    ...overrides,
  }
}

describe('mapUserProfile', () => {
  it('normalises ids to strings and maps the ranking + stats', () => {
    const profile = mapUserProfile(profileResponse())

    expect(profile.user).toEqual({
      id: '42',
      username: 'leo',
      avatarUrl: 'http://x/leo.png',
    })
    expect(profile.globalRanking).toEqual({
      rankPosition: 7,
      points: 31,
      exactCount: 4,
      total: 128,
    })
    expect(profile.stats).toEqual({
      exact: 4,
      correctWinner: 3,
      goalDifference: 2,
      missed: 5,
      total: 14,
    })
  })

  it('maps shared groups (general first), normalising group ids', () => {
    const profile = mapUserProfile(profileResponse())

    expect(profile.sharedGroups).toEqual([
      {
        id: '1',
        name: 'Pool General',
        isGeneralPool: true,
        rankPosition: 7,
        points: 31,
        total: 128,
      },
      {
        id: '5',
        name: 'Los Amigos',
        isGeneralPool: false,
        rankPosition: 2,
        points: 31,
        total: 9,
      },
    ])
  })

  it('passes through the gated tournament prediction (hidden)', () => {
    const profile = mapUserProfile(profileResponse())
    expect(profile.tournamentPrediction).toEqual({
      available: false,
      reason: 'tournament_not_started',
    })
  })

  it('maps a revealed-but-empty tournament prediction to a null podium', () => {
    const profile = mapUserProfile(
      profileResponse({
        tournament_prediction: { available: true, prediction: null },
      }),
    )
    expect(profile.tournamentPrediction).toEqual({
      available: true,
      podium: null,
    })
  })

  it('resolves the embedded podium teams + scorer when revealed', () => {
    const profile = mapUserProfile(
      profileResponse({
        tournament_prediction: {
          available: true,
          prediction: {
            id: 3,
            tournament_id: 1,
            champion_id: 10,
            runner_up_id: 11,
            third_place_id: null,
            fourth_place_id: null,
            top_scorer_id: 99,
            locked_at: '2026-06-11T00:00:00Z',
            locked: true,
            champion: {
              id: 10,
              name: 'Argentina',
              code3: 'ARG',
              flag_url: 'http://x/arg.png',
            },
            runner_up: {
              id: 11,
              name: 'Brasil',
              code3: 'BRA',
              flag_url: 'http://x/bra.png',
            },
            third_place: null,
            fourth_place: null,
            top_scorer: {
              id: 99,
              name: 'Messi',
              external_id: null,
              team_id: 10,
              team: {
                id: 10,
                name: 'Argentina',
                code3: 'ARG',
                flag_url: 'http://x/arg.png',
              },
            },
          },
        },
      }),
    )

    expect(profile.tournamentPrediction).toEqual({
      available: true,
      podium: {
        champion: {
          id: '10',
          name: 'Argentina',
          code3: 'ARG',
          flagUrl: 'http://x/arg.png',
        },
        runnerUp: {
          id: '11',
          name: 'Brasil',
          code3: 'BRA',
          flagUrl: 'http://x/bra.png',
        },
        thirdPlace: null,
        fourthPlace: null,
        topScorer: {
          id: '99',
          name: 'Messi',
          externalId: null,
          teamId: '10',
          team: {
            id: '10',
            name: 'Argentina',
            code3: 'ARG',
            flagUrl: 'http://x/arg.png',
          },
        },
      },
    })
  })
})

describe('mapUserPredictionsPage', () => {
  function predictionsResponse(): UserPredictionsResponse {
    return {
      entries: [
        {
          id: 500,
          external_id: null,
          tournament_id: 1,
          kickoff_at: '2026-06-12T19:00:00Z',
          status: 'finished',
          phase: 'group_stage',
          group: 'A',
          minute: null,
          home_score: 2,
          away_score: 1,
          advancing_team_id: null,
          home_team: { id: 10, name: 'Argentina', code3: 'ARG', flag_url: null },
          away_team: { id: 11, name: 'Brasil', code3: 'BRA', flag_url: null },
          prediction: {
            predicted_home_score: 2,
            predicted_away_score: 1,
            predicted_advancing_team_id: null, // group stage → no advance
            points: 5,
          },
        },
      ],
      page: 1,
      has_more: true,
    }
  }

  it('maps each entry to a Match carrying the viewed user pick (ids as strings)', () => {
    const page = mapUserPredictionsPage(predictionsResponse())

    expect(page.hasMore).toBe(true)
    expect(page.page).toBe(1)
    const [match] = page.entries
    expect(match.id).toBe('500')
    expect(match.homeTeam?.id).toBe('10')
    expect(match.myPrediction).toEqual({
      id: '500:pick',
      matchId: '500',
      predictedHomeScore: 2,
      predictedAwayScore: 1,
      predictedAdvancingTeamId: null,
      lockedAt: null,
      locked: true,
      points: 5,
    })
  })

  it('maps the viewed user advancing pick on a knockout entry (id as string)', () => {
    const page = mapUserPredictionsPage({
      entries: [
        {
          id: 600,
          external_id: null,
          tournament_id: 1,
          kickoff_at: '2026-07-04T19:00:00Z',
          status: 'finished',
          phase: 'round_of_32',
          group: null,
          minute: null,
          home_score: 1,
          away_score: 0,
          advancing_team_id: 10, // Argentina advanced
          home_team: { id: 10, name: 'Argentina', code3: 'ARG', flag_url: null },
          away_team: { id: 11, name: 'Brasil', code3: 'BRA', flag_url: null },
          prediction: {
            predicted_home_score: 1,
            predicted_away_score: 0,
            predicted_advancing_team_id: 10, // picked Argentina to advance
            points: 8,
          },
        },
      ],
      page: 1,
      has_more: false,
    })

    const [match] = page.entries
    expect(match.advancingTeamId).toBe('10')
    expect(match.myPrediction?.predictedAdvancingTeamId).toBe('10')
  })
})
