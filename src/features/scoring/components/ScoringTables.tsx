import { cn } from '@/lib/cn'
import {
  SPECIAL_RULE_TYPES,
  type PhaseMultiplier,
  type ScoringConfig,
  type ScoringRule,
} from '@/features/scoring/types'

/** `1 → "×1"`, `1.5 → "×1.5"`, `4 → "×4"` — drop the trailing `.0`. */
function formatMultiplier(value: number): string {
  return `×${Number.isInteger(value) ? value : value.toString()}`
}

interface PointsTableProps {
  /** Accessible caption + visible heading for the table. */
  caption: string
  rows: ScoringRule[]
}

/** A two-column rule → points table (the match + specials tables share it). */
function PointsTable({ caption, rows }: PointsTableProps) {
  if (rows.length === 0) return null
  return (
    <table
      aria-label={caption}
      className="border-border bg-surface w-full overflow-hidden rounded-2xl border text-left"
    >
      <caption className="text-text-secondary px-4 pt-4 pb-1 text-left text-body-sm font-semibold">
        {caption}
      </caption>
      <tbody>
        {rows.map((rule) => (
          <tr key={rule.ruleType} className="border-border border-t">
            <th
              scope="row"
              className="text-body-sm px-4 py-3 font-medium"
            >
              {rule.label}
            </th>
            <td className="text-brand-primary font-display px-4 py-3 text-right text-xl font-bold tabular-nums">
              {rule.points}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** A two-column phase → multiplier table. */
function MultiplierTable({
  caption,
  rows,
}: {
  caption: string
  rows: PhaseMultiplier[]
}) {
  if (rows.length === 0) return null
  return (
    <table
      aria-label={caption}
      className="border-border bg-surface w-full overflow-hidden rounded-2xl border text-left"
    >
      <caption className="text-text-secondary px-4 pt-4 pb-1 text-left text-body-sm font-semibold">
        {caption}
      </caption>
      <tbody>
        {rows.map((row) => (
          <tr key={row.phase} className="border-border border-t">
            <th scope="row" className="text-body-sm px-4 py-2.5 font-medium">
              {row.label}
            </th>
            <td className="text-brand-primary font-display px-4 py-2.5 text-right text-body-lg font-bold tabular-nums">
              {formatMultiplier(row.multiplier)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export interface ScoringTablesProps {
  config: ScoringConfig
  className?: string
}

/**
 * The shared, presentational scoring tables (SCRUM-296): per-match points,
 * tournament-wide specials (podium + top scorer), and the per-phase
 * multiplier. One source of truth for both the in-app rules page and the
 * public landing — all copy (labels, points) comes from the backend config,
 * nothing hardcoded. Rules are partitioned into the match/specials tables by
 * `SPECIAL_RULE_TYPES`; order within each table is the config's (canonical).
 */
export function ScoringTables({ config, className }: ScoringTablesProps) {
  const matchRules = config.scoringRules.filter(
    (rule) => !SPECIAL_RULE_TYPES.has(rule.ruleType),
  )
  const specialRules = config.scoringRules.filter((rule) =>
    SPECIAL_RULE_TYPES.has(rule.ruleType),
  )

  return (
    <div className={cn('grid gap-6 md:grid-cols-2', className)}>
      <PointsTable caption="Puntos por partido" rows={matchRules} />
      <PointsTable caption="Pronósticos del torneo" rows={specialRules} />
      <MultiplierTable
        caption="Multiplicador por fase"
        rows={config.phaseMultipliers}
      />
    </div>
  )
}
