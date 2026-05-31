import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PredictionStepper } from '@/components/matches/PredictionStepper'

function renderStepper(props: Partial<Parameters<typeof PredictionStepper>[0]> = {}) {
  const onChange = vi.fn()
  render(
    <PredictionStepper
      label="Uruguay"
      value={props.value ?? 1}
      onChange={onChange}
      {...props}
    />,
  )
  return { onChange }
}

describe('PredictionStepper', () => {
  it('exposes the value as an accessible spinbutton', () => {
    renderStepper({ value: 3 })
    const spin = screen.getByRole('spinbutton', { name: 'Uruguay' })
    expect(spin).toHaveAttribute('aria-valuenow', '3')
    expect(spin).toHaveAttribute('aria-valuemin', '0')
    expect(spin).toHaveAttribute('aria-valuemax', '20')
  })

  it('increments and decrements via the +/- buttons', async () => {
    const user = userEvent.setup()
    const { onChange } = renderStepper({ value: 2 })

    await user.click(screen.getByRole('button', { name: 'Sumar gol: Uruguay' }))
    expect(onChange).toHaveBeenLastCalledWith(3)

    await user.click(screen.getByRole('button', { name: 'Restar gol: Uruguay' }))
    expect(onChange).toHaveBeenLastCalledWith(1)
  })

  it('responds to arrow, Home and End keys', async () => {
    const user = userEvent.setup()
    const { onChange } = renderStepper({ value: 5 })
    const spin = screen.getByRole('spinbutton', { name: 'Uruguay' })

    spin.focus()
    await user.keyboard('{ArrowUp}')
    expect(onChange).toHaveBeenLastCalledWith(6)
    await user.keyboard('{ArrowDown}')
    expect(onChange).toHaveBeenLastCalledWith(4)
    await user.keyboard('{Home}')
    expect(onChange).toHaveBeenLastCalledWith(0)
    await user.keyboard('{End}')
    expect(onChange).toHaveBeenLastCalledWith(20)
  })

  it('clamps at the bounds and disables the edge buttons', async () => {
    const user = userEvent.setup()
    const { onChange } = renderStepper({ value: 0 })

    expect(screen.getByRole('button', { name: 'Restar gol: Uruguay' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Sumar gol: Uruguay' }))
    expect(onChange).toHaveBeenLastCalledWith(1)
  })

  it('does not change when disabled', async () => {
    const user = userEvent.setup()
    const { onChange } = renderStepper({ value: 2, disabled: true })

    await user.click(screen.getByRole('button', { name: 'Sumar gol: Uruguay' }))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('spinbutton', { name: 'Uruguay' })).toHaveAttribute(
      'tabindex',
      '-1',
    )
  })
})
