/**
 * Detect the user's IANA timezone (e.g. "America/Montevideo"), falling back
 * to UTC if the runtime does not expose one.
 */
export function detectUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}
