import { BrandSurface } from '@/components/brand/BrandSurface'
import { SectionLabel } from '@/components/ui/section-label'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import type { RankingEntry } from '@/types/domain'

export interface MyPositionBlockProps {
  /** Top rows of the current slice — `entries[0]` is the leader. */
  entries: RankingEntry[]
  /** The `me` window from `include_me=true` (the user's row + neighbours). */
  me: RankingEntry[]
  isLoading?: boolean
}

/** "A 99 pts del 1º" / "A 1 pt del 1º", or "Liderás la tabla" for the leader. */
function gapLine(myRow: RankingEntry, leader: RankingEntry | undefined): string {
  const gap = leader ? leader.points - myRow.points : 0
  if (myRow.position === 1 || gap <= 0) return 'Liderás la tabla'
  return `A ${gap} ${gap === 1 ? 'pt' : 'pts'} del 1º`
}

/**
 * The current user's position in the selected ranking, on the textured teal
 * surface: big rank on the left, points + gap to the leader on the right.
 * Sticky on mobile (below the app header) so it stays visible while the
 * leaderboard scrolls. Renders nothing when the user has no row yet.
 */
export function MyPositionBlock({
  entries,
  me,
  isLoading = false,
}: MyPositionBlockProps) {
  const { currentUser } = useCurrentUser()

  const stickyClasses = 'sticky top-18 z-30 md:static'

  if (isLoading) {
    return <Skeleton className={`h-24 w-full rounded-xl ${stickyClasses}`} />
  }

  // The `me` window is a slice around the user, so pick THEIR row by `userId`
  // (never `me[0]`); fall back to the top rows when the window is empty.
  const myId = currentUser?.id ?? null
  const myRow =
    myId !== null
      ? (me.find((e) => e.userId === myId) ??
        entries.find((e) => e.userId === myId) ??
        null)
      : null

  if (!myRow) return null

  return (
    <BrandSurface className={`shadow-sm ${stickyClasses}`}>
      <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
        <div>
          <SectionLabel size="sm" className="tracking-wide text-white/80">
            TU POSICIÓN
          </SectionLabel>
          <p className="font-display text-display-lg mt-1 leading-none font-bold">
            {myRow.position}º
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-display-md leading-none font-bold">
            {myRow.points}
            <span className="text-body-sm font-normal text-white/70"> pts</span>
          </p>
          <p className="text-body-sm mt-1 text-white/70">
            {gapLine(myRow, entries[0])}
          </p>
        </div>
      </div>
    </BrandSurface>
  )
}
