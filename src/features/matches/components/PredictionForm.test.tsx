import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PredictionForm } from '@/features/matches/components/PredictionForm'
import type { Match } from '@/features/matches/types'

vi.mock('@/features/matches/hooks/useUpsertPrediction', () => ({
  useUpsertPrediction: vi.fn(),
}))
vi.mock('@/hooks/useToast', () => ({ toast: vi.fn() }))
vi.mock('@/api/auth.api', () => ({ getApiError: vi.fn(() => null) }))

import { useUpsertPrediction } from '@/features/matches/hooks/useUpsertPrediction'

const useUpsertPredictionMock = vi.mocked(useUpsertPrediction)
const mutate = vi.fn()

function makeMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: '10',
    externalId: null,
    tournamentId: '1',
    kickoffAt: '2099-06-12T19:00:00Z',
    status: 'scheduled',
    phase: 'group_stage',
    homeScore: null,
    awayScore: null,
    advancingTeamId: null,
    homeTeam: { id: '1', name: 'Uruguay', code3: 'URU', flagUrl: null },
    awayTeam: { id: '2', name: 'Argentina', code3: 'ARG', flagUrl: null },
    myPrediction: null,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  useUpsertPredictionMock.mockReturnValue({
    mutate,
    isPending: false,
  } as unknown as ReturnType<typeof useUpsertPrediction>)
})

describe('PredictionForm', () => {
  it('submits the scores for a group-stage match', async () => {
    const user = userEvent.setup()
    render(<PredictionForm match={makeMatch()} />)

    await user.click(screen.getByRole('button', { name: 'Sumar gol: Uruguay' }))
    await user.click(
      screen.getByRole('button', { name: 'Guardar pronóstico' }),
    )

    await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1))
    expect(mutate.mock.calls[0][0]).toEqual({
      match_id: '10',
      predicted_home_score: 1,
      predicted_away_score: 0,
      predicted_advancing_team_id: undefined,
    })
  })

  it('blocks a knockout submit until an advancing team is chosen', async () => {
    const user = userEvent.setup()
    render(<PredictionForm match={makeMatch({ phase: 'round_of_32' })} />)

    await user.click(
      screen.getByRole('button', { name: 'Guardar pronóstico' }),
    )

    expect(
      await screen.findByText('Elegí qué equipo pasa de ronda.'),
    ).toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()

    await user.click(screen.getByRole('radio', { name: 'Uruguay' }))
    await user.click(
      screen.getByRole('button', { name: 'Guardar pronóstico' }),
    )

    await waitFor(() =>
      expect(mutate.mock.calls.at(-1)?.[0]).toMatchObject({
        predicted_advancing_team_id: '1',
      }),
    )
  })
})
