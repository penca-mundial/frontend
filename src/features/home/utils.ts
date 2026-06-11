import { differenceInCalendarDays } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { detectUserTimezone } from '@/lib/timezone'

/** Where we are in the tournament: "Día {day} de {total}" (total null = open-ended). */
export interface TournamentProgress {
  /** 1-based day number, clamped to ≥1 (pre-kickoff reads as day 1). */
  day: number
  /** Total tournament days, or null when `endsAt` isn't known yet (fallback). */
  total: number | null
}

/** Parse a 'yyyy-MM-dd' string to a Date at local midnight, for pure day diffs. */
function plainDate(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/**
 * Compute the tournament day. Day 1 is the start's UTC calendar date — the
 * backend stores a date marker (e.g. `2026-06-11T00:00:00Z` = "June 11") — while
 * "today" uses the user's local date, so the day rolls over at their midnight.
 *
 * Anchoring the start on its UTC date (not a timezone-shifted instant) avoids an
 * off-by-one: a `00:00Z` start converted into a UTC-negative zone (e.g.
 * Montevideo, UTC-3) lands on the PREVIOUS local day, which previously inflated
 * "Día 1" to "Día 2". `now` is injectable for tests.
 */
export function tournamentProgress(
  startsAt: string,
  endsAt: string | null,
  tz: string = detectUserTimezone(),
  now: Date = new Date(),
): TournamentProgress {
  const startDate = plainDate(startsAt.slice(0, 10))
  const todayDate = plainDate(formatInTimeZone(now, tz, 'yyyy-MM-dd'))
  const day = Math.max(1, differenceInCalendarDays(todayDate, startDate) + 1)
  const total = endsAt
    ? differenceInCalendarDays(plainDate(endsAt.slice(0, 10)), startDate) + 1
    : null
  return { day, total }
}
