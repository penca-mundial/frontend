import { Skeleton } from '@/components/ui/skeleton'
import { SectionLabel } from '@/components/ui/section-label'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useRanking } from '@/features/rankings/hooks/useRanking'

/** One stat cell. */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <SectionLabel size="sm" tone="secondary">
        {label}
      </SectionLabel>
      <span className="font-display text-display-md leading-none font-bold tabular-nums">
        {value}
      </span>
    </div>
  )
}

/**
 * The user's headline stats on the profile (SCRUM-199): global position,
 * accumulated points and exact-score count, from the global leaderboard's `me`
 * row (`/rankings/global?include_me`). The "of M" / "of Y" denominators the
 * mock shows aren't exposed by the backend yet, so the bare values are shown
 * (documented on the ticket) rather than invented.
 */
export function ProfileStats() {
  const { currentUser } = useCurrentUser()
  const ranking = useRanking({ scope: 'global' })

  const myId = currentUser?.id ?? null
  const myRow =
    myId !== null
      ? (ranking.me.find((e) => e.userId === myId) ??
        ranking.entries.find((e) => e.userId === myId) ??
        null)
      : null

  if (ranking.isLoading) {
    return (
      <section className="border-border bg-surface rounded-xl border p-5">
        <div className="flex gap-10" aria-busy="true">
          <Skeleton className="h-12 w-16 rounded-md" />
          <Skeleton className="h-12 w-16 rounded-md" />
          <Skeleton className="h-12 w-16 rounded-md" />
        </div>
      </section>
    )
  }

  return (
    <section className="border-border bg-surface flex flex-wrap gap-x-10 gap-y-4 rounded-xl border p-5">
      <Stat label="Posición" value={myRow ? `${myRow.position}º` : '—'} />
      <Stat label="Puntos" value={String(myRow?.points ?? 0)} />
      <Stat label="Aciertos exactos" value={String(myRow?.exactCount ?? 0)} />
    </section>
  )
}
