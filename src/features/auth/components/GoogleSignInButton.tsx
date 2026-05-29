import { Button } from '@/components/ui/button'

/**
 * Resolve the backend's Google OAuth request URL. Devise mounts the omniauth
 * request phase at `<backend-origin>/users/auth/google_oauth2` (NOT under the
 * `/api/v1` API namespace), so we take the origin of `VITE_API_URL` and append
 * the Devise path.
 */
function googleOauthUrl(): string {
  const base = import.meta.env.VITE_API_URL ?? ''
  let origin = ''
  try {
    origin = base ? new URL(base).origin : ''
  } catch {
    origin = ''
  }
  return `${origin}/users/auth/google_oauth2`
}

/**
 * Kicks off the Google OAuth flow with a full-page navigation to the backend.
 * A redirect (not fetch) is required: the backend sets the session cookie and
 * bounces the browser back to `/auth/google/callback`.
 */
export function GoogleSignInButton({
  label = 'Continuar con Google',
}: {
  label?: string
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="border-border-strong w-full gap-2.5"
      onClick={() => {
        window.location.href = googleOauthUrl()
      }}
    >
      <GoogleIcon />
      {label}
    </Button>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.7-6.2 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3c-2 1.5-4.5 2.4-7.4 2.4-5.1 0-9.5-3.3-11.2-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.3 5.3c-.4.4 6.6-4.8 6.6-15 0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  )
}
