import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TournamentPredictionForm } from '@/features/tournament-predictions/components/TournamentPredictionForm'
import type { MatchTeam } from '@/features/matches/types'
import type { Player } from '@/features/tournament-predictions/types'

vi.mock('@/hooks/useToast', () => ({ toast: vi.fn() }))
import { toast } from '@/hooks/useToast'

const toastMock = vi.mocked(toast)

const TEAMS: MatchTeam[] = [
  { id: '1', name: 'Uruguay', code3: 'URU', flagUrl: null },
  { id: '2', name: 'Argentina', code3: 'ARG', flagUrl: null },
]
const PLAYERS: Player[] = [
  { id: '9', name: 'Luis Suárez', externalId: 'e9', teamId: '1', team: null },
]

beforeEach(() => vi.clearAllMocks())

describe('TournamentPredictionForm', () => {
  it('submits a flat payload (partial allowed) and shows success feedback', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(
      <TournamentPredictionForm
        teams={TEAMS}
        players={PLAYERS}
        initial={null}
        onSubmit={onSubmit}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Guardar pronóstico/ }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        champion_id: null,
        runner_up_id: null,
        third_place_id: null,
        fourth_place_id: null,
        top_scorer_id: null,
      }),
    )
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: expect.stringContaining('guardado') }),
    )
  })

  it('surfaces a server 422 validation error', async () => {
    const user = userEvent.setup()
    const error = {
      isAxiosError: true,
      response: {
        data: {
          error: {
            code: 'validation_error',
            message: 'Datos inválidos.',
            details: { errors: ['El campeón no es un equipo del torneo.'] },
          },
        },
      },
    }
    const onSubmit = vi.fn().mockRejectedValue(error)
    render(
      <TournamentPredictionForm
        teams={TEAMS}
        players={PLAYERS}
        initial={null}
        onSubmit={onSubmit}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Guardar pronóstico/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El campeón no es un equipo del torneo.',
    )
  })
})
