import { formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatInTimeZone } from 'date-fns-tz'
import { detectUserTimezone } from '@/lib/timezone'

/** Match statuses for which predictions are still open. */
const OPEN_STATUSES = new Set(['scheduled', 'upcoming'])

function toDate(date: string | Date): Date {
  return typeof date === 'string' ? parseISO(date) : date
}

/**
 * Named output shapes for a match kickoff, so every screen renders kickoff
 * times identically. `'day-header'` is the uppercased day heading used to
 * group the fixture list.
 */
export type KickoffFormat = 'time' | 'date' | 'full' | 'day-header'

const KICKOFF_PATTERNS: Record<KickoffFormat, string> = {
  time: 'HH:mm', // 23:00
  date: 'EEE d MMM', // mié 17 jun
  full: 'EEE d MMM yyyy, HH:mm', // mié 17 jun 2026, 23:00
  'day-header': 'EEE d MMM', // MIÉ 17 JUN (uppercased below)
}

/**
 * Single source of truth for rendering a match kickoff. The backend always
 * sends `kickoff_at` as ISO 8601 UTC (Zulu); this converts it to the user's
 * timezone — the browser's IANA zone by default — before formatting, so a
 * match at '2026-06-18T02:00:00Z' shows as "17 jun, 23:00" in Montevideo
 * (UTC-3), never the raw UTC "18 jun, 02:00". Pass an explicit `tz` to format
 * for a specific zone (used in tests). Never format server timestamps with
 * `new Date()` / `toLocale*` — always go through here.
 */
export function formatKickoff(
  isoUtc: string | Date,
  format: KickoffFormat,
  tz: string = detectUserTimezone(),
): string {
  const formatted = formatInTimeZone(
    toDate(isoUtc),
    tz,
    KICKOFF_PATTERNS[format],
    { locale: es },
  )
  return format === 'day-header' ? formatted.toUpperCase() : formatted
}

/** Human-friendly distance to kickoff in Spanish (e.g. "en 2 horas"). */
export function formatTimeUntilKickoff(date: string | Date): string {
  return formatDistanceToNow(toDate(date), { addSuffix: true, locale: es })
}

/**
 * Stable grouping key for the calendar day of a kickoff in the user's
 * timezone (e.g. "2026-06-12"). Use it to bucket matches by day; pair with
 * `formatDayHeading` for the visible heading.
 */
export function matchDayKey(date: string | Date, tz: string): string {
  return formatInTimeZone(toDate(date), tz, 'yyyy-MM-dd')
}

/** Capitalize the first letter of every whitespace-delimited word. */
function titleCase(value: string): string {
  return value.replace(/(^|\s)(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase())
}

/**
 * Prominent day heading for the grouped fixture list, in the user's timezone
 * and title-cased to match the design (e.g. "Lunes, 15 De Junio").
 */
export function formatDayHeading(date: string | Date, tz: string): string {
  return titleCase(
    formatInTimeZone(toDate(date), tz, "EEEE, d 'de' MMMM", { locale: es }),
  )
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
