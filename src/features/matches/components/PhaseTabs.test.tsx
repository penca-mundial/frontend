import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PhaseTabs } from '@/features/matches/components/PhaseTabs'
import type { MatchPhase } from '@/features/matches/types'

const ALL_PHASES: MatchPhase[] = [
  'group_stage',
  'round_of_32',
  'round_of_16',
  'quarter_final',
  'semi_final',
  'third_place',
  'final',
]

describe('PhaseTabs', () => {
  it('renders rioplatense phase labels and marks the active tab', () => {
    render(<PhaseTabs value="all" onChange={vi.fn()} phases={ALL_PHASES} />)
    expect(screen.getByRole('tab', { name: 'Todas' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: 'Dieciseisavos' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Final' })).toBeInTheDocument()
  })

  it('reports the chosen phase', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PhaseTabs value="all" onChange={onChange} phases={ALL_PHASES} />)
    await user.click(screen.getByRole('tab', { name: 'Cuartos' }))
    expect(onChange).toHaveBeenCalledWith('quarter_final')
  })
})
