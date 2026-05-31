import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PhaseTabs } from '@/features/matches/components/PhaseTabs'

describe('PhaseTabs', () => {
  it('renders rioplatense phase labels and marks the active tab', () => {
    render(<PhaseTabs value="all" onChange={vi.fn()} />)
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
    render(<PhaseTabs value="all" onChange={onChange} />)
    await user.click(screen.getByRole('tab', { name: 'Cuartos' }))
    expect(onChange).toHaveBeenCalledWith('quarter_final')
  })
})
