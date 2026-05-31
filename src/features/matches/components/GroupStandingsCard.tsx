import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { MatchCardExpandable } from '@/components/matches/MatchCardExpandable'
import type { Match, MatchTeam, Standing } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'
import { cn } from '@/lib/cn'

export interface GroupStandingsCardProps {
  /** The group's letter, e.g. "A". */
  groupLetter: string
  /** Standings rows for this group, ordered by position (from `GET /standings`). */
  standings: Standing[]
  /** The group's matches, for the collapsible inline-predictable list. */
  matches: Match[]
  /** User predictions keyed by match id, for the expandable match cards. */
  predictions?: Map<string, Prediction>
  timezone?: string
}

function Flag({ team }: { team: MatchTeam | null }) {
  if (team?.flagUrl) {
    return (
      <span className="inline-flex h-[14px] w-[20px] shrink-0 overflow-hidden rounded-[2px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]">
        <img src={team.flagUrl} alt="" className="block size-full object-cover" />
      </span>
    )
  }
  return (
    <span className="bg-surface-muted text-text-secondary text-mono-mini inline-flex h-[14px] w-[20px] shrink-0 items-center justify-center rounded-[2px]">
      {team?.code3 ?? '—'}
    </span>
  )
}

/**
 * A single group's standings table plus its (collapsible) matches, rendered in
 * the fixture "Grupos" tab. Standings come from the real `GET /standings`
 * endpoint (see `useStandings`); matches reuse `MatchCardExpandable` (inline-
 * predictable). The mobile layout keeps Equipo / DG / Pts and hides the
 * secondary columns via Tailwind responsive utilities.
 */
export function GroupStandingsCard({
  groupLetter,
  standings,
  matches,
  predictions,
  timezone,
}: GroupStandingsCardProps) {
  const [open, setOpen] = useState(false)
  const played = matches.filter((m) => m.status === 'finished').length

  const numCols = 'text-text-secondary w-7 text-center text-mono-mini'
  const secondary = 'hidden sm:table-cell' // hidden on mobile per the spec

  return (
    <div className="border-border bg-surface overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between gap-2 p-4 pb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-brand-primary font-display text-body-lg font-semibold">
            Grupo {groupLetter}
          </h3>
          <span className="bg-surface-muted text-text-secondary text-mono-mini rounded-full px-2 py-0.5">
            {played} / {matches.length} jugados
          </span>
        </div>
      </div>

      <table className="w-full px-4 text-left">
        <thead>
          <tr className="text-text-disabled text-mono-mini">
            <th className="w-6 px-4 py-1 font-medium" scope="col">
              <span className="sr-only">Posición</span>
            </th>
            <th className="py-1 font-medium" scope="col">
              Equipo
            </th>
            <th className={cn(numCols, secondary)} scope="col">PJ</th>
            <th className={cn(numCols, secondary)} scope="col">G</th>
            <th className={cn(numCols, secondary)} scope="col">E</th>
            <th className={cn(numCols, secondary)} scope="col">P</th>
            <th className={cn(numCols, secondary)} scope="col">GF</th>
            <th className={cn(numCols, secondary)} scope="col">GC</th>
            <th className={cn(numCols)} scope="col">DG</th>
            <th className="text-text-primary w-9 px-4 text-center text-mono-mini font-semibold" scope="col">
              PTS
            </th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row) => (
            <tr key={row.id} className="border-border border-t">
              <td className="text-text-secondary px-4 py-2 text-mono-mini tabular-nums">
                {row.position}
              </td>
              <td className="py-2">
                <div className="flex items-center gap-2">
                  <Flag team={row.team} />
                  <span className="text-body-sm font-semibold">
                    {row.team?.name ?? 'Por definir'}
                  </span>
                  <span className="text-text-disabled text-mono-mini">
                    {row.team?.code3}
                  </span>
                </div>
              </td>
              <td className={cn(numCols, secondary, 'tabular-nums')}>{row.playedGames}</td>
              <td className={cn(numCols, secondary, 'tabular-nums')}>{row.won}</td>
              <td className={cn(numCols, secondary, 'tabular-nums')}>{row.draw}</td>
              <td className={cn(numCols, secondary, 'tabular-nums')}>{row.lost}</td>
              <td className={cn(numCols, secondary, 'tabular-nums')}>{row.goalsFor}</td>
              <td className={cn(numCols, secondary, 'tabular-nums')}>{row.goalsAgainst}</td>
              <td className={cn(numCols, 'tabular-nums')}>
                {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
              </td>
              <td className="text-text-primary px-4 py-2 text-center text-body-sm font-bold tabular-nums">
                {row.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="border-border bg-surface-muted/40 hover:bg-surface-muted text-text-secondary mt-2 flex w-full items-center justify-between gap-2 border-t px-4 py-2.5 text-body-sm transition-colors"
      >
        <span>
          {matches.length} {matches.length === 1 ? 'partido' : 'partidos'} del
          grupo
        </span>
        <ChevronDown
          size={16}
          className={cn('transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="flex flex-col gap-3 p-4">
          {matches.map((match) => (
            <MatchCardExpandable
              key={match.id}
              match={match}
              prediction={predictions?.get(match.id) ?? null}
              timezone={timezone}
            />
          ))}
        </div>
      )}
    </div>
  )
}
