import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { SectionLabel } from '@/components/ui/section-label'
import { MatchFilters, type TeamFilter } from '@/features/matches/components/MatchFilters'
import { MatchList } from '@/features/matches/components/MatchList'
import { FixtureTabs, type FixtureTab } from '@/features/matches/components/FixtureTabs'
import { BracketView } from '@/components/matches/BracketView'
import { useMatches } from '@/features/matches/hooks/useMatches'
import { usePredictions } from '@/features/predictions/hooks/usePredictions'
import type { Match, MatchTeam } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'
import { buildBracketRounds } from '@/features/matches/utils'
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

interface GroupComposition {
  group: string
  teams: MatchTeam[]
}

/**
 * Group composition derived purely from match data: matches carrying a `group`
 * letter are bucketed by it, teams deduped within each bucket, buckets sorted
 * alphabetically. Makes no assumption about group count, letter range or team
 * count — it renders whatever the data contains (tournament-agnostic).
 */
function deriveGroups(matches: Match[]): GroupComposition[] {
  const byGroup = new Map<string, Map<string, MatchTeam>>()
  for (const match of matches) {
    if (!match.group) continue
    let teams = byGroup.get(match.group)
    if (!teams) {
      teams = new Map<string, MatchTeam>()
      byGroup.set(match.group, teams)
    }
    for (const team of [match.homeTeam, match.awayTeam]) {
      if (team && !teams.has(team.id)) teams.set(team.id, team)
    }
  }
  return [...byGroup.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'es'))
    .map(([group, teams]) => ({
      group,
      teams: [...teams.values()].sort((a, b) =>
        a.name.localeCompare(b.name, 'es'),
      ),
    }))
}

/** Placeholder for the Grupos tab until matches carry group letters. */
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
 * - Grupos: group composition (teams per group) derived from match `group`
 *   letters; falls back to a placeholder when no group data is present.
 * - Eliminación: the read-only knockout bracket (empty-state handled by
 *   `BracketView` until knockout matches are seeded).
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

  const groups = useMemo(() => deriveGroups(allMatches), [allMatches])

  const bracketRounds = useMemo(
    () => buildBracketRounds(allMatches),
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
        (groups.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <div
                key={g.group}
                className="border-border bg-surface rounded-xl border p-4"
              >
                <SectionLabel as="h3" className="mb-3 block">
                  Grupo {g.group}
                </SectionLabel>
                <ul className="flex flex-col gap-2">
                  {g.teams.map((team) => (
                    <li key={team.id} className="flex items-center gap-2.5">
                      {team.flagUrl ? (
                        <img
                          src={team.flagUrl}
                          alt=""
                          className="h-[18px] w-[26px] shrink-0 rounded-[3px] object-cover"
                        />
                      ) : (
                        <span className="bg-surface-muted text-text-secondary inline-flex h-[18px] w-[26px] shrink-0 items-center justify-center rounded-[3px] text-[10px]">
                          {team.code3 ?? '—'}
                        </span>
                      )}
                      <span className="text-body-sm">{team.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <GruposPlaceholder />
        ))}

      {tab === 'eliminacion' && (
        <BracketView
          rounds={bracketRounds}
          onSelectMatch={(match) => navigate(`/app/matches/${match.id}`)}
        />
      )}
    </div>
  )
}
