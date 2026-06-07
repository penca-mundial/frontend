/** Soft background + readable text pairs for the group avatars. */
const AVATAR_PALETTE = [
  'bg-[#d7ede9] text-[#115e59]', // teal
  'bg-[#fef3c7] text-[#92400e]', // amber
  'bg-[#dbeafe] text-[#1e40af]', // blue
  'bg-[#dcfce7] text-[#166534]', // green
  'bg-[#ede9fe] text-[#6d28d9]', // violet
  'bg-[#fce7f3] text-[#9d174d]', // pink
  'bg-[#ffedd5] text-[#9a3412]', // orange
] as const

/** Two-letter initials for a group avatar (first letters of the first two
 *  words, falling back to the first two letters of a single word). */
export function groupInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  const second = words[1]?.[0] ?? words[0][1] ?? ''
  return (words[0][0] + second).toUpperCase()
}

/** Deterministic, order-sensitive string hash for picking an avatar color. */
function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

/** A stable avatar color (bg + text classes) derived from the group name. */
export function avatarColor(name: string): string {
  return AVATAR_PALETTE[hashString(name) % AVATAR_PALETTE.length]
}
