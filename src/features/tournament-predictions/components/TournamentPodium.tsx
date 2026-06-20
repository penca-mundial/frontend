import { SectionLabel } from '@/components/ui/section-label'
import { SoccerBall } from '@/components/icons/SoccerBall'
import { TeamFlag } from '@/features/tournament-predictions/components/TeamFlag'
import { cn } from '@/lib/cn'

/** Podium rank 1–4, or 'scorer' for the top-scorer row. */
export type PodiumRank = 1 | 2 | 3 | 4 | 'scorer'

/** A resolved podium row: medallion rank, role label, and the picked flag/name. */
export interface PodiumRow {
  rank: PodiumRank
  /** Secondary role label shown on the right (Campeón / Goleador / …). */
  role: string
  flagUrl: string | null
  name: string
}

/**
 * The five podium roles in display order (full podium then the top scorer).
 * Single source of truth so every consumer renders the same rows in the same
 * order; each resolves its own flag/name for the slot.
 */
export const PODIUM_ROLES: { rank: PodiumRank; role: string }[] = [
  { rank: 1, role: 'Campeón' },
  { rank: 2, role: 'Subcampeón' },
  { rank: 3, role: 'Tercer puesto' },
  { rank: 4, role: 'Cuarto puesto' },
  { rank: 'scorer', role: 'Goleador' },
]

/** Per-rank medallion tint (gold / silver / bronze / neutral / scorer-teal). */
const MEDAL_TINT: Record<PodiumRank, string> = {
  1: 'bg-brand-accent-soft text-[#92400e]',
  2: 'bg-surface-sunken text-text-secondary',
  3: 'bg-[#FBE8D3] text-[#9A5B27]',
  4: 'bg-surface-muted text-text-secondary',
  scorer: 'bg-brand-primary-soft text-brand-primary-hover',
}

/** A small medallion: the position number, or a boot icon for the scorer. */
function RankMedallion({ rank }: { rank: PodiumRank }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'font-display inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
        MEDAL_TINT[rank],
      )}
    >
      {rank === 'scorer' ? <SoccerBall className="size-3.5" /> : rank}
    </span>
  )
}

export interface TournamentPodiumProps {
  rows: PodiumRow[]
}

/**
 * Presentational podium: each row is [medallion · flag · name] on the left with
 * the role (Campeón, Subcampeón, … Goleador) as secondary text on the right.
 * Shared by the home dashboard card and the public profile (Open/Closed — both
 * resolve their own picks and hand over the same `rows`). A missing pick is
 * rendered as "—" by the caller.
 */
export function TournamentPodium({ rows }: TournamentPodiumProps) {
  return (
    <dl className="divide-border divide-y">
      {rows.map((row) => (
        <div
          key={row.role}
          className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
        >
          <dd className="text-body-sm flex min-w-0 items-center gap-2.5 font-semibold">
            <RankMedallion rank={row.rank} />
            <TeamFlag flagUrl={row.flagUrl} />
            <span className="truncate">{row.name}</span>
          </dd>
          <SectionLabel as="dt" tone="secondary" size="sm" className="shrink-0">
            {row.role}
          </SectionLabel>
        </div>
      ))}
    </dl>
  )
}
