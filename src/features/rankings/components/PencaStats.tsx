import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { SectionLabel } from '@/components/ui/section-label'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useRanking } from '@/features/rankings/hooks/useRanking'
import { useGroupEvolution } from '@/features/rankings/hooks/useGroupEvolution'
import {
  EvolutionChart,
  type EvolutionMetric,
} from '@/features/rankings/components/EvolutionChart'
import type { RankingEntry } from '@/types/domain'
import { cn } from '@/lib/cn'

interface PencaStatsProps {
  groupId: string
}

/** One stat cell of the summary card. */
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

const METRICS: { value: EvolutionMetric; label: string }[] = [
  { value: 'points', label: 'Puntos' },
  { value: 'rank', label: 'Posición' },
]

/** Designed empty / loading / error wrapper for the chart area. */
function ChartNotice({ children }: { children: string }) {
  return (
    <div className="border-border bg-surface rounded-xl border border-dashed p-8 text-center">
      <p className="text-text-secondary text-body-sm mx-auto max-w-sm">
        {children}
      </p>
    </div>
  )
}

/**
 * Per-penca stats tab (SCRUM-302): a summary card (your points / rank / exact
 * count, from the group leaderboard) over a single evolution chart with a
 * Puntos / Posición toggle. The chart is gated server-side by `available`
 * (off until the 5th finished match) — until then a designed empty-state
 * shows. Loading and error are handled per area; the summary stays visible
 * even while the chart is locked.
 */
export function PencaStats({ groupId }: PencaStatsProps) {
  const { currentUser } = useCurrentUser()
  const [metric, setMetric] = useState<EvolutionMetric>('points')

  const ranking = useRanking({ scope: { groupId } })
  const evolution = useGroupEvolution(groupId)

  const myId = currentUser?.id ?? null
  const myRow: RankingEntry | null =
    myId !== null
      ? (ranking.me.find((e) => e.userId === myId) ??
        ranking.entries.find((e) => e.userId === myId) ??
        null)
      : null

  return (
    <div className="flex flex-col gap-5">
      {/* Summary card (AC2) */}
      <section className="border-border bg-surface rounded-xl border p-5">
        {ranking.isLoading ? (
          <div className="flex gap-10" aria-busy="true">
            <Skeleton className="h-12 w-16 rounded-md" />
            <Skeleton className="h-12 w-16 rounded-md" />
            <Skeleton className="h-12 w-16 rounded-md" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            <Stat label="Puntos" value={String(myRow?.points ?? 0)} />
            <Stat label="Puesto" value={myRow ? `${myRow.position}º` : '—'} />
            <Stat label="Exactos" value={String(myRow?.exactCount ?? 0)} />
          </div>
        )}
      </section>

      {/* Evolution chart (AC3) + states (AC4) */}
      <section className="border-border bg-surface rounded-xl border p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <SectionLabel size="sm" tone="secondary" as="h2">
            Evolución
          </SectionLabel>
          {evolution.data?.available && (
            <div
              role="group"
              aria-label="Métrica del gráfico"
              className="border-border bg-surface-muted inline-flex rounded-lg border p-0.5"
            >
              {METRICS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  aria-pressed={metric === m.value}
                  onClick={() => setMetric(m.value)}
                  className={cn(
                    'rounded-md px-3 py-1 text-body-sm font-medium transition-colors',
                    metric === m.value
                      ? 'bg-surface text-text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary',
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {evolution.isLoading ? (
          <Skeleton className="h-64 w-full rounded-lg" />
        ) : evolution.isError ? (
          <ChartNotice>
            No pudimos cargar las estadísticas. Intentá de nuevo.
          </ChartNotice>
        ) : !evolution.data?.available || evolution.data.lines.length === 0 ? (
          <ChartNotice>
            La evolución se activa a partir del 5º partido jugado del Mundial.
            Volvé cuando arranque la acción.
          </ChartNotice>
        ) : (
          <EvolutionChart
            lines={evolution.data.lines}
            metric={metric}
            currentUserId={myId}
          />
        )}
      </section>
    </div>
  )
}
