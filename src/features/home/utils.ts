import { differenceInCalendarDays } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { detectUserTimezone } from '@/lib/timezone'

/** Where we are in the tournament: "Día {day} de {total}" (total null = open-ended). */
export interface TournamentProgress {
  /** 1-based day number, clamped to ≥1 (pre-kickoff reads as day 1). */
  day: number
  /** Total tournament days, or null when `endsAt` isn't known yet (fallback). */
  total: number | null
}

/**
 * Compute the tournament day from its bounds, counting whole calendar days in
 * the user's timezone (so the rollover happens at local midnight, not UTC).
 * `now` is injectable for tests. When `endsAt` is null the total is unknown and
 * the header falls back to "Día N" without the denominator.
 */
export function tournamentProgress(
  startsAt: string,
  endsAt: string | null,
  tz: string = detectUserTimezone(),
  now: Date = new Date(),
): TournamentProgress {
  const start = toZonedTime(startsAt, tz)
  const today = toZonedTime(now, tz)
  const day = Math.max(1, differenceInCalendarDays(today, start) + 1)
  const total = endsAt
    ? differenceInCalendarDays(toZonedTime(endsAt, tz), start) + 1
    : null
  return { day, total }
}
