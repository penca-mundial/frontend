import { formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatInTimeZone } from 'date-fns-tz'

/** Match statuses for which predictions are still open. */
const OPEN_STATUSES = new Set(['scheduled', 'upcoming'])

function toDate(date: string | Date): Date {
  return typeof date === 'string' ? parseISO(date) : date
}

/**
 * Format a match kickoff (ISO 8601 UTC from the backend, or a Date) for
 * display in the user's timezone. Never use `new Date()` to format server
 * data — always go through the provided timezone.
 */
export function formatMatchDate(date: string | Date, tz: string): string {
  return formatInTimeZone(toDate(date), tz, 'EEE d MMM yyyy, HH:mm', {
    locale: es,
  })
}

/** Human-friendly distance to kickoff in Spanish (e.g. "en 2 horas"). */
export function formatTimeUntilKickoff(date: string | Date): string {
  return formatDistanceToNow(toDate(date), { addSuffix: true, locale: es })
}

/**
 * Whether predictions for a match are locked: once it is no longer in an
 * open status, or once kickoff time has passed.
 */
export function isLockedForPrediction(
  kickoffAt: string | Date,
  status: string,
): boolean {
  if (!OPEN_STATUSES.has(status)) {
    return true
  }
  return Date.now() >= toDate(kickoffAt).getTime()
}
