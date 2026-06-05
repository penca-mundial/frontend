import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { MatchFilters, type TeamFilter } from '@/features/matches/components/MatchFilters'
import { MatchList } from '@/features/matches/components/MatchList'
import { FixtureTabs, type FixtureTab } from '@/features/matches/components/FixtureTabs'
import { GroupStandingsCard } from '@/features/matches/components/GroupStandingsCard'
import { EliminationView } from '@/components/matches/EliminationView'
import { useMatches } from '@/features/matches/hooks/useMatches'
import { usePredictions } from '@/features/predictions/hooks/usePredictions'
import { useStandings } from '@/features/matches/hooks/useStandings'
import type { Match, MatchTeam } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'
import { matchDayKey } from '@/lib/date'
import { detectUserTimezone } from '@/lib/timezone'

/** Distinct teams appearing in a set of matches, sorted by name. */
function collectTeams(matches: Match[]): MatchTeam[] {
  const byId = new Map<string, MatchTeam>()
  for (const match of matches) {
    for (const team of [match.homeTeam, match.awayTeam]) {
      if (team && !byId.has(team.id)) byId.set(team.id, team)
    }
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'))
}

/** Buckets a group's matches by group letter, kept chronological. */
function matchesByGroupLetter(matches: Match[]): Map<string, Match[]> {
  const map = new Map<string, Match[]>()
  for (const match of matches) {
    if (!match.group) continue
    const bucket = map.get(match.group)
    if (bucket) bucket.push(match)
    else map.set(match.group, [match])
  }
  for (const bucket of map.values()) {
    bucket.sort(
      (a, b) =>
        new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime(),
    )
  }
  return map
}

/** Placeholder for the Grupos tab until standings are available. */
function GruposPlaceholder() {
  return (
    <div className="border-border bg-surface rounded-xl border border-dashed p-8 text-center">
      <p className="text-text-primary text-body font-semibold">Próximamente</p>
      <p className="text-text-secondary text-body-sm mx-auto mt-1 max-w-md">
        Los grupos se mostrarán cuando se publique la información oficial del
        Mundial 2026.
      </p>
    </div>
  )
}

/**
 * Public fixture with three views (segmented tabs):
 * - Calendario: every match grouped by day, predicted inline via
 *   `MatchCardExpandable`, with team/date filters.
 * - Grupos: one `GroupStandingsCard` per group from the computed standings
 *   endpoint (`GET /tournaments/:id/standings`, derived from the matches —
 *   every group at 0 pre-tournament, live during) plus collapsible inline-
 *   predictable matches; a skeleton while loading, placeholder only when empty.
 * - Eliminación: knockout matches as a sub-phase-filterable, inline-predictable
 *   list (default) or the read-only bracket, toggled via `EliminationView`.
 *
 * Kickoff times always render in the viewer's browser timezone.
 */
export function FixturePage() {
  const timezone = detectUserTimezone()
  const navigate = useNavigate()

  const [tab, setTab] = useState<FixtureTab>('calendario')
  // null = the user hasn't touched it yet → defaults to the first matchday.
  const [dateFrom, setDateFrom] = useState<string | null>(null)
  const [dateTo, setDateTo] = useState('')
  const [teamId, setTeamId] = useState<TeamFilter>('all')

  const { data, isLoading, isError } = useMatches({})
  const { data: predictionData } = usePredictions(1, 100)

  const allMatches = useMemo(() => data?.matches ?? [], [data])
  const teamOptions = useMemo(() => collectTeams(allMatches), [allMatches])
  const predictionsByMatch = useMemo(() => {
    const map = new Map<string, Prediction>()
    for (const prediction of predictionData?.predictions ?? []) {
      map.set(prediction.matchId, prediction)
    }
    return map
  }, [predictionData])

  // Tournament's first matchday (in the viewer's timezone), used as the default
  // lower bound for the date filter so the fixture opens at kick-off, not on
  // long-past test data.
  const earliestDay = useMemo(() => {
    if (allMatches.length === 0) return ''
    const earliest = allMatches.reduce(
      (min, match) => (match.kickoffAt < min ? match.kickoffAt : min),
      allMatches[0].kickoffAt,
    )
    return matchDayKey(earliest, timezone)
  }, [allMatches, timezone])
  const effectiveDateFrom = dateFrom ?? earliestDay

  const visibleMatches = useMemo(
    () =>
      allMatches.filter((match) => {
        if (
          teamId !== 'all' &&
          match.homeTeam?.id !== teamId &&
          match.awayTeam?.id !== teamId
        ) {
          return false
        }
        const day = matchDayKey(match.kickoffAt, timezone)
        if (effectiveDateFrom && day < effectiveDateFrom) return false
        if (dateTo && day > dateTo) return false
        return true
      }),
    [allMatches, teamId, effectiveDateFrom, dateTo, timezone],
  )

  const hasLiveMatches = useMemo(
    () => allMatches.some((match) => match.status === 'live'),
    [allMatches],
  )
  const tournamentId = allMatches[0]?.tournamentId
  const { data: standingsGroups, isLoading: standingsLoading } = useStandings(
    tournamentId,
    { hasLiveMatches, enabled: tab === 'grupos' },
  )
  const matchesByGroup = useMemo(
    () => matchesByGroupLetter(allMatches),
    [allMatches],
  )

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      <h1 className="text-display-lg font-display font-semibold">Fixture</h1>

      <FixtureTabs value={tab} onChange={setTab} />

      {tab === 'calendario' && (
        <div className="flex flex-col gap-5">
          <MatchFilters
            dateFrom={effectiveDateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            teamId={teamId}
            teamOptions={teamOptions}
            onTeamChange={setTeamId}
          />

          {isLoading ? (
            <div className="flex flex-col gap-3" aria-busy="true">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <p className="text-danger text-body">
              No pudimos cargar los partidos. Intentá de nuevo.
            </p>
          ) : visibleMatches.length === 0 ? (
            <p className="text-text-secondary text-body">
              No hay partidos para estos filtros.
            </p>
          ) : (
            <MatchList
              matches={visibleMatches}
              predictions={predictionsByMatch}
              timezone={timezone}
            />
          )}
        </div>
      )}

      {tab === 'grupos' &&
        (standingsLoading ? (
          <div className="flex flex-col gap-4" aria-busy="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        ) : standingsGroups && standingsGroups.length > 0 ? (
          <div className="flex flex-col gap-4">
            {standingsGroups.map((g) => (
              <GroupStandingsCard
                key={g.group}
                groupLetter={g.group}
                standings={g.rows}
                matches={matchesByGroup.get(g.group) ?? []}
                predictions={predictionsByMatch}
                timezone={timezone}
              />
            ))}
          </div>
        ) : (
          <GruposPlaceholder />
        ))}

      {tab === 'eliminacion' && (
        <EliminationView
          matches={allMatches}
          predictions={predictionsByMatch}
          timezone={timezone}
          onSelectMatch={(match) => navigate(`/app/matches/${match.id}`)}
        />
      )}
    </div>
  )
}
