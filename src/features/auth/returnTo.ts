/**
 * "Return to" destination preserved across login / signup / Google OAuth, so an
 * invite link (`/app/groups/join?code=X`) survives the auth detour and the user
 * lands back where they intended.
 *
 * Two carriers: a `?returnTo=` query param (within the SPA, e.g. ProtectedRoute
 * → /login) and `sessionStorage` (across the OAuth round-trip, which leaves and
 * re-enters the front origin in the same tab). Only internal app paths are
 * accepted, to avoid open-redirects.
 */
export const RETURN_TO_PARAM = 'returnTo'
const STORAGE_KEY = 'penca:return-to'

/** Only same-origin app paths (`/app/...`, not `//evil` or absolute URLs). */
export function isSafeReturnTo(value: string | null | undefined): value is string {
  return typeof value === 'string' && /^\/app\/[^/]/.test(value)
}

/** Read + validate the `returnTo` query param from a location search string. */
export function readReturnTo(search: string): string | null {
  const value = new URLSearchParams(search).get(RETURN_TO_PARAM)
  return isSafeReturnTo(value) ? value : null
}

/** Build a `/login` URL that carries the intended destination. */
export function loginWithReturnTo(target: string): string {
  return isSafeReturnTo(target)
    ? `/login?${RETURN_TO_PARAM}=${encodeURIComponent(target)}`
    : '/login'
}

/** Persist the destination for the OAuth round-trip (no-op if unsafe/empty). */
export function stashReturnTo(value: string | null): void {
  if (isSafeReturnTo(value)) sessionStorage.setItem(STORAGE_KEY, value)
}

/** Read and clear the stashed destination (validated). */
export function takeReturnTo(): string | null {
  const value = sessionStorage.getItem(STORAGE_KEY)
  if (value !== null) sessionStorage.removeItem(STORAGE_KEY)
  return isSafeReturnTo(value) ? value : null
}
