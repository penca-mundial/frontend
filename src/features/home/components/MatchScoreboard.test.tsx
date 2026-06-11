import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MatchScoreboard } from '@/features/home/components/MatchScoreboard'
import type { Match } from '@/features/matches/types'

// Real teams carry flag images, so the imageless code3 fallback never shows.
const MEX = { id: '1', name: 'México', code3: 'MEX', flagUrl: 'https://flags/mex.png' }
const RSA = { id: '2', name: 'Sudáfrica', code3: 'RSA', flagUrl: 'https://flags/rsa.png' }

function match(): Match {
  return {
    id: '10',
    externalId: null,
    tournamentId: '1',
    kickoffAt: '2026-06-12T16:00:00Z',
    status: 'live',
    phase: 'group_stage',
    group: 'A',
    minute: 30,
    homeScore: 1,
    awayScore: 0,
    advancingTeamId: null,
    homeTeam: MEX,
    awayTeam: RSA,
    myPrediction: null,
  }
}

describe('MatchScoreboard responsive sizing (SCRUM-271 mobile fix)', () => {
  it('sizes flags moderate on mobile and restores the desktop size at sm:', () => {
    const { container } = render(<MatchScoreboard match={match()} />)
    const flags = container.querySelectorAll('img')
    expect(flags).toHaveLength(2)

    for (const img of flags) {
      const box = img.parentElement as HTMLElement
      // Mobile-first moderate size so the flag never crowds the score…
      expect(box.className).toContain('w-[54px]')
      expect(box.className).toContain('h-9')
      // …and the full desktop size returns at the sm: breakpoint (unchanged look).
      expect(box.className).toContain('sm:w-[84px]')
      expect(box.className).toContain('sm:h-[56px]')
      // The flag must not shrink/deform when space is tight.
      expect(box.className).toContain('shrink-0')
      // No bare fixed desktop size that would apply at every width (the bug).
      expect(box.className).not.toMatch(/(?<!sm:)w-\[84px\]/)
    }
  })

  it('keeps both scores rendered and responsively sized so neither hides behind a flag', () => {
    render(<MatchScoreboard match={match()} />)
    for (const value of ['1', '0']) {
      const score = screen.getByText(value)
      expect(score.className).toContain('text-4xl')
      expect(score.className).toContain('sm:text-6xl')
    }
  })
})
