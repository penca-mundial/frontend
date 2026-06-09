/** Two-letter avatar initials from a username (preferred) or email local-part. */
export function initialsOf(
  username: string | null,
  email: string,
): string {
  const source = username ?? email.split('@')[0] ?? email
  return source.slice(0, 2).toUpperCase()
}
