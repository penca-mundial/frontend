import { DashboardCard } from '@/features/home/components/DashboardCard'
import type { ProfileStats } from '@/features/users/types'

interface StatChip {
  label: string
  value: number
  /** A subtle accent for the headline buckets (exact hits, total). */
  tone?: 'exact' | 'total'
}

const TONE_CLASS: Record<NonNullable<StatChip['tone']>, string> = {
  exact: 'text-success',
  total: 'text-brand-primary',
}

export interface ProfileStatsBlockProps {
  stats: ProfileStats
}

/**
 * "Stats" on a public profile: the accuracy buckets the backend aggregates over
 * the viewed user's scored predictions (exact / correct winner / goal
 * difference / missed) plus the total, as a simple responsive grid of chips.
 */
export function ProfileStatsBlock({ stats }: ProfileStatsBlockProps) {
  const chips: StatChip[] = [
    { label: 'Exactos', value: stats.exact, tone: 'exact' },
    { label: 'Ganador', value: stats.correctWinner },
    { label: 'Diferencia', value: stats.goalDifference },
    { label: 'Errados', value: stats.missed },
    { label: 'Total', value: stats.total, tone: 'total' },
  ]

  return (
    <DashboardCard title="Stats">
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {chips.map((chip) => (
          <div
            key={chip.label}
            className="border-border bg-surface-muted/40 flex flex-col gap-0.5 rounded-lg border px-3 py-2"
          >
            <dd
              className={`font-display text-xl font-bold tabular-nums ${
                chip.tone ? TONE_CLASS[chip.tone] : ''
              }`}
            >
              {chip.value}
            </dd>
            <dt className="text-text-secondary text-[11px] font-semibold tracking-wide uppercase">
              {chip.label}
            </dt>
          </div>
        ))}
      </dl>
    </DashboardCard>
  )
}
