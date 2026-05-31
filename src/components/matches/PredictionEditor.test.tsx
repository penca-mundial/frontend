import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PredictionEditor } from '@/components/matches/PredictionEditor'
import type { Match } from '@/features/matches/types'

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

describe('PredictionEditor', () => {
  it('saves the entered scores for a group-stage match', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(
      <PredictionEditor match={makeMatch()} onSave={onSave} onCancel={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: 'Sumar gol: Uruguay' }))
    await user.click(screen.getByRole('button', { name: /Guardar pronóstico/ }))

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        home: 1,
        away: 0,
        advancing: undefined,
      }),
    )
  })

  it('disables save for a knockout match until an advancing team is picked', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(
      <PredictionEditor
        match={makeMatch({ phase: 'round_of_32' })}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('button', { name: /Guardar pronóstico/ }),
    ).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: /URU/ }))
    await user.click(screen.getByRole('button', { name: /Guardar pronóstico/ }))

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ advancing: '1' }),
      ),
    )
  })

  it('calls onCancel from the Cancelar button', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <PredictionEditor
        match={makeMatch()}
        onSave={vi.fn()}
        onCancel={onCancel}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalled()
  })
})
