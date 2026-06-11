import { describe, expect, it } from 'vitest'
import { tournamentProgress } from '@/features/home/utils'

// World Cup 2026: 11 Jun → 19 Jul = 39 calendar days. Pin tz to UTC so the
// ISO instants and calendar days line up without an offset shift.
const START = '2026-06-11T00:00:00Z'
const END = '2026-07-19T00:00:00Z'

describe('tournamentProgress', () => {
  it('counts day 1 on the start date and N thereafter', () => {
    expect(
      tournamentProgress(START, END, 'UTC', new Date('2026-06-11T12:00:00Z')),
    ).toEqual({ day: 1, total: 39 })
    expect(
      tournamentProgress(START, END, 'UTC', new Date('2026-06-12T00:30:00Z')),
    ).toEqual({ day: 2, total: 39 })
    expect(
      tournamentProgress(START, END, 'UTC', new Date('2026-07-19T00:00:00Z')),
    ).toEqual({ day: 39, total: 39 })
  })

  it('clamps to day 1 before the tournament starts', () => {
    expect(
      tournamentProgress(START, END, 'UTC', new Date('2026-06-09T00:00:00Z')),
    ).toEqual({ day: 1, total: 39 })
  })

  it('falls back to a null total when the end date is unknown', () => {
    expect(
      tournamentProgress(START, null, 'UTC', new Date('2026-06-13T00:00:00Z')),
    ).toEqual({ day: 3, total: null })
  })

  it('reads day 1 on the start date for a 00:00Z start in a UTC-negative zone (regression)', () => {
    // Live data: starts_at = 2026-06-11T00:00:00Z. In Montevideo (UTC-3) that
    // instant is 2026-06-10 21:00 — converting it would land on June 10 and
    // wrongly show "Día 2" on June 11. Day 1 must anchor on the UTC date.
    expect(
      tournamentProgress(
        '2026-06-11T00:00:00Z',
        END,
        'America/Montevideo',
        new Date('2026-06-11T06:03:00Z'), // 03:03 Montevideo, June 11
      ),
    ).toEqual({ day: 1, total: 39 })
  })

  it('rolls over at local midnight in the user timezone', () => {
    // Start at Montevideo (UTC-3) midnight on Jun 11.
    const startMvd = '2026-06-11T03:00:00Z'
    // 23:00 Montevideo, still Jun 11 → day 1.
    expect(
      tournamentProgress(
        startMvd,
        END,
        'America/Montevideo',
        new Date('2026-06-12T02:00:00Z'),
      ).day,
    ).toBe(1)
    // 01:00 Montevideo the next calendar day → day 2.
    expect(
      tournamentProgress(
        startMvd,
        END,
        'America/Montevideo',
        new Date('2026-06-12T04:00:00Z'),
      ).day,
    ).toBe(2)
  })
})
