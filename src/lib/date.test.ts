import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatKickoff, matchDayKey, todayDayKey } from '@/lib/date'

// A match stored as 02:00 UTC on Jun 18 is the evening of Jun 17 in the
// Americas — the exact bug this helper fixes.
const KICKOFF = '2026-06-18T02:00:00Z'

describe('formatKickoff', () => {
  it('renders the time in the given timezone (Montevideo, UTC-3)', () => {
    expect(formatKickoff(KICKOFF, 'time', 'America/Montevideo')).toBe('23:00')
  })

  it('renders the time in New York (UTC-4 in June)', () => {
    expect(formatKickoff(KICKOFF, 'time', 'America/New_York')).toBe('22:00')
  })

  it('renders the raw UTC time when asked for UTC', () => {
    expect(formatKickoff(KICKOFF, 'time', 'UTC')).toBe('02:00')
  })

  it('rolls the date back to the previous day in Montevideo', () => {
    expect(formatKickoff(KICKOFF, 'date', 'America/Montevideo')).toBe(
      'mié 17 jun',
    )
  })

  it('renders the full date-time in the given timezone', () => {
    expect(formatKickoff(KICKOFF, 'full', 'America/Montevideo')).toBe(
      'mié 17 jun 2026, 23:00',
    )
  })

  it('uppercases the day-header', () => {
    expect(formatKickoff(KICKOFF, 'day-header', 'America/Montevideo')).toBe(
      'MIÉ 17 JUN',
    )
  })
})

describe('matchDayKey', () => {
  it('buckets a match by its local calendar day, not the UTC day', () => {
    expect(matchDayKey(KICKOFF, 'America/Montevideo')).toBe('2026-06-17')
    expect(matchDayKey(KICKOFF, 'UTC')).toBe('2026-06-18')
  })
})

describe('todayDayKey', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns the timezone's calendar day, not the UTC one, near midnight", () => {
    // 02:00 UTC on the 18th is still 23:00 on the 17th in Montevideo (UTC-3):
    // a toISOString()-based "today" would wrongly report the 18th.
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-18T02:00:00Z'))

    expect(todayDayKey('America/Montevideo')).toBe('2026-06-17')
    expect(todayDayKey('UTC')).toBe('2026-06-18')
  })
})
