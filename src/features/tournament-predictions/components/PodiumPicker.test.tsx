import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PodiumPicker } from '@/features/tournament-predictions/components/PodiumPicker'
import type { MatchTeam } from '@/features/matches/types'

const TEAMS: MatchTeam[] = [
  { id: '1', name: 'Uruguay', code3: 'URU', flagUrl: null },
  { id: '2', name: 'Argentina', code3: 'ARG', flagUrl: null },
  { id: '3', name: 'Brasil', code3: 'BRA', flagUrl: null },
  { id: '4', name: 'Francia', code3: 'FRA', flagUrl: null },
]

describe('PodiumPicker', () => {
  it('excludes a team already picked in another spot', async () => {
    const user = userEvent.setup()
    render(
      <PodiumPicker
        teams={TEAMS}
        value={{
          championId: '1', // Uruguay taken as champion
          runnerUpId: null,
          thirdPlaceId: null,
          fourthPlaceId: null,
        }}
        onChange={vi.fn()}
      />,
    )

    // Open the runner-up select (second combobox).
    const triggers = screen.getAllByRole('combobox')
    await user.click(triggers[1])

    const optionNames = screen
      .getAllByRole('option')
      .map((option) => option.textContent)

    expect(optionNames).not.toContain('Uruguay') // excluded — it's the champion
    expect(optionNames).toContain('Argentina')
    expect(optionNames).toContain('Brasil')
  })

  it('opens the dropdown in popper mode (anchored to the trigger, native scroll)', async () => {
    const user = userEvent.setup()
    render(
      <PodiumPicker
        teams={TEAMS}
        value={{
          championId: null,
          runnerUpId: null,
          thirdPlaceId: null,
          fourthPlaceId: null,
        }}
        onChange={vi.fn()}
      />,
    )

    await user.click(screen.getAllByRole('combobox')[0])

    // The popper-only offset classes are applied only when SelectContent runs
    // with position="popper" (the primitive's default since SCRUM-288) —
    // item-aligned mode (the old default) stretched/shrank and reset its
    // scroll while scrolling.
    const content = document.querySelector('[data-slot="select-content"]')!
    expect(content).not.toBeNull()
    expect(content.className).toContain('data-[side=bottom]:translate-y-1')
  })
})
