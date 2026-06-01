/**
 * Decorative team flag for the tournament-prediction pickers. The flag carries
 * no information the text doesn't (`alt=""` + `aria-hidden`), so the team/player
 * name remains the accessible label. Renders nothing when there's no flag URL
 * (falls back to name-only).
 */
export function TeamFlag({ flagUrl }: { flagUrl: string | null }) {
  if (!flagUrl) return null
  return (
    <img
      src={flagUrl}
      alt=""
      aria-hidden="true"
      className="h-[14px] w-[20px] shrink-0 rounded-[2px] object-cover shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
    />
  )
}
