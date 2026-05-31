import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { MatchCardExpandable } from '@/components/matches/MatchCardExpandable'
import type { Match, MatchTeam } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'
import { cn } from '@/lib/cn'

/** One row of a group standings table, accumulated from finished matches. */
interface TeamRow {
  team: MatchTeam
  pj: number
  g: number
  e: number
  p: number
  gf: number
  gc: number
  dg: number
  pts: number
}

export interface GroupStandingsCardProps {
  /** The group's letter, e.g. "A". */
  groupLetter: string
  /** The (up to 6) matches of this group. */
  matches: Match[]
  /** User predictions keyed by match id, for the expandable match cards. */
  predictions?: Map<string, Prediction>
  timezone?: string
}

/** Build the standings from the group's finished matches (3-1-0 points). */
function computeStandings(matches: Match[]): TeamRow[] {
  const rows = new Map<string, TeamRow>()
  const ensure = (team: MatchTeam): TeamRow => {
    let row = rows.get(team.id)
    if (!row) {
      row = { team, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 }
      rows.set(team.id, row)
    }
    return row
  }

  for (const match of matches) {
    if (!match.homeTeam || !match.awayTeam) continue
    const home = ensure(match.homeTeam)
    const away = ensure(match.awayTeam)
    if (
      match.status !== 'finished' ||
      match.homeScore === null ||
      match.awayScore === null
    ) {
      continue
    }
    home.pj += 1
    away.pj += 1
    home.gf += match.homeScore
    home.gc += match.awayScore
    away.gf += match.awayScore
    away.gc += match.homeScore
    if (match.homeScore > match.awayScore) {
      home.g += 1
      home.pts += 3
      away.p += 1
    } else if (match.homeScore < match.awayScore) {
      away.g += 1
      away.pts += 3
      home.p += 1
    } else {
      home.e += 1
      away.e += 1
      home.pts += 1
      away.pts += 1
    }
  }

  for (const row of rows.values()) row.dg = row.gf - row.gc

  return [...rows.values()].sort(
    (a, b) =>
      b.pts - a.pts ||
      b.dg - a.dg ||
      b.gf - a.gf ||
      a.team.name.localeCompare(b.team.name, 'es'),
  )
}

function Flag({ team }: { team: MatchTeam }) {
  if (team.flagUrl) {
    return (
      <span className="inline-flex h-[14px] w-[20px] shrink-0 overflow-hidden rounded-[2px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]">
        <img src={team.flagUrl} alt="" className="block size-full object-cover" />
      </span>
    )
  }
  return (
    <span className="bg-surface-muted text-text-secondary text-mono-mini inline-flex h-[14px] w-[20px] shrink-0 items-center justify-center rounded-[2px]">
      {team.code3 ?? '—'}
    </span>
  )
}

/**
 * A single group's standings table plus its (collapsible) matches.
 *
 * Scaffold for the "Grupos" tab: the standings are derived client-side from the
 * group's finished matches, and the matches reuse `MatchCardExpandable`. It is
 * not wired into the fixture yet because the backend doesn't expose which group
 * a match belongs to — that arrives with SCRUM-257 (the `group` field). Once it
 * does, group the matches by letter and render one card per group.
 */
export function GroupStandingsCard({
  groupLetter,
  matches,
  predictions,
  timezone,
}: GroupStandingsCardProps) {
  const [open, setOpen] = useState(false)
  const standings = computeStandings(matches)
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
          {standings.map((row, index) => (
            <tr key={row.team.id} className="border-border border-t">
              <td className="text-text-secondary px-4 py-2 text-mono-mini tabular-nums">
                {index + 1}
              </td>
              <td className="py-2">
                <div className="flex items-center gap-2">
                  <Flag team={row.team} />
                  <span className="text-body-sm font-semibold">
                    {row.team.name}
                  </span>
                  <span className="text-text-disabled text-mono-mini">
                    {row.team.code3}
                  </span>
                </div>
              </td>
              <td className={cn(numCols, secondary, 'tabular-nums')}>{row.pj}</td>
              <td className={cn(numCols, secondary, 'tabular-nums')}>{row.g}</td>
              <td className={cn(numCols, secondary, 'tabular-nums')}>{row.e}</td>
              <td className={cn(numCols, secondary, 'tabular-nums')}>{row.p}</td>
              <td className={cn(numCols, secondary, 'tabular-nums')}>{row.gf}</td>
              <td className={cn(numCols, secondary, 'tabular-nums')}>{row.gc}</td>
              <td className={cn(numCols, 'tabular-nums')}>
                {row.dg > 0 ? `+${row.dg}` : row.dg}
              </td>
              <td className="text-text-primary px-4 py-2 text-center text-body-sm font-bold tabular-nums">
                {row.pts}
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
              readOnly
            />
          ))}
        </div>
      )}
    </div>
  )
}
