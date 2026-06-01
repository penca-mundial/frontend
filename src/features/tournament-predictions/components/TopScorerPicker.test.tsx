import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TopScorerPicker } from '@/features/tournament-predictions/components/TopScorerPicker'
import type { Player } from '@/features/tournament-predictions/types'

const team = { id: '1', name: 'Argentina', code3: 'ARG', flagUrl: null }
const PLAYERS: Player[] = [
  { id: '9', name: 'Lionel Messi', externalId: 'e9', teamId: '1', team },
  { id: '7', name: 'Cristiano Ronaldo', externalId: 'e7', teamId: '2', team: null },
]

describe('TopScorerPicker', () => {
  it('searches across all players client-side', async () => {
    const user = userEvent.setup()
    render(
      <TopScorerPicker players={PLAYERS} value={null} onChange={vi.fn()} />,
    )

    await user.click(screen.getByRole('combobox'))
    expect(screen.getByText('Lionel Messi')).toBeInTheDocument()
    expect(screen.getByText('Cristiano Ronaldo')).toBeInTheDocument()

    await user.type(screen.getByPlaceholderText('Buscar jugador…'), 'Messi')

    expect(screen.getByText('Lionel Messi')).toBeInTheDocument()
    expect(screen.queryByText('Cristiano Ronaldo')).not.toBeInTheDocument()
  })

  it('reports the chosen player', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <TopScorerPicker players={PLAYERS} value={null} onChange={onChange} />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByText('Lionel Messi'))

    expect(onChange).toHaveBeenCalledWith('9')
  })
})
