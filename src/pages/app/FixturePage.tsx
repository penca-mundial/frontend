import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { MatchFilters, type TeamFilter } from '@/features/matches/components/MatchFilters'
import { MatchList } from '@/features/matches/components/MatchList'
import { FixtureTabs, type FixtureTab } from '@/features/matches/components/FixtureTabs'
import { GroupStandingsCard } from '@/features/matches/components/GroupStandingsCard'
import { ProjectedStandingsNote } from '@/features/matches/components/ProjectedStandingsNote'
import { EliminationView } from '@/components/matches/EliminationView'
import { useMatches } from '@/features/matches/hooks/useMatches'
import { usePredictions } from '@/features/predictions/hooks/usePredictions'
import { useStandings } from '@/features/matches/hooks/useStandings'
import type { Match, MatchTeam } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'
import { matchDayKey, todayDayKey } from '@/lib/date'
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
 * - Grupos: one `GroupStandingsCard` per group from the PROJECTED standings
 *   endpoint (`GET /tournaments/:id/standings/projected` — official results
 *   blended with the user's predictions, flagged by `ProjectedStandingsNote`)
 *   plus collapsible inline-predictable matches; a skeleton while loading, an
 *   error message on failure, placeholder only when empty.
 * - Eliminación: knockout matches as a sub-phase-filterable, inline-predictable
 *   list (default) or the read-only bracket, toggled via `EliminationView`.
 *
 * Kickoff times always render in the viewer's browser timezone.
 */
export function FixturePage() {
  const timezone = detectUserTimezone()
  const navigate = useNavigate()

  const [tab, setTab] = useState<FixtureTab>('calendario')
  // "Desde" defaults to today (user's timezone) so the fixture opens on the
  // matches still open for predictions; once the user edits it, their choice
  // wins (state is only seeded on mount).
  const [dateFrom, setDateFrom] = useState(() => todayDayKey(timezone))
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
        if (dateFrom && day < dateFrom) return false
        if (dateTo && day > dateTo) return false
        return true
      }),
    [allMatches, teamId, dateFrom, dateTo, timezone],
  )

  const hasLiveMatches = useMemo(
    () => allMatches.some((match) => match.status === 'live'),
    [allMatches],
  )
  const tournamentId = allMatches[0]?.tournamentId
  const {
    data: standingsGroups,
    isLoading: standingsLoading,
    isError: standingsError,
  } = useStandings(tournamentId, {
    hasLiveMatches,
    enabled: tab === 'grupos',
    projected: true,
  })
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
            dateFrom={dateFrom}
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
        ) : standingsError ? (
          <p className="text-danger text-body">
            No pudimos cargar las posiciones. Intentá de nuevo.
          </p>
        ) : standingsGroups && standingsGroups.length > 0 ? (
          <div className="flex flex-col gap-4">
            <ProjectedStandingsNote />
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
