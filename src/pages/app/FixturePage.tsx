import { useMemo, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { MatchFilters, type TeamFilter } from '@/features/matches/components/MatchFilters'
import { MatchList } from '@/features/matches/components/MatchList'
import { PhaseTabs, type PhaseFilter } from '@/features/matches/components/PhaseTabs'
import { useMatches } from '@/features/matches/hooks/useMatches'
import { usePredictions } from '@/features/predictions/hooks/usePredictions'
import type { Match, MatchPhase, MatchTeam } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'
import { KNOCKOUT_ROUND_ORDER } from '@/features/matches/utils'
import { matchDayKey } from '@/lib/date'
import { detectUserTimezone } from '@/lib/timezone'

/** All phases in tournament order; tabs render only those actually present. */
const PHASE_ORDER: readonly MatchPhase[] = ['group_stage', ...KNOCKOUT_ROUND_ORDER]

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

/** Phases that have at least one match, in tournament order. */
function collectPhases(matches: Match[]): MatchPhase[] {
  const present = new Set(matches.map((match) => match.phase))
  return PHASE_ORDER.filter((phase) => present.has(phase))
}

/**
 * Public fixture: all tournament matches, filterable by phase (underlined tabs),
 * date range and team — all client-side, since the whole fixture is a small,
 * cacheable list. Matches are grouped by day and predicted inline via
 * MatchCardExpandable; the user's predictions are fetched separately and joined
 * by match id, since the list endpoint doesn't embed them. Kickoff times always
 * render in the viewer's browser timezone.
 */
export function FixturePage() {
  const timezone = detectUserTimezone()

  const [phase, setPhase] = useState<PhaseFilter>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [teamId, setTeamId] = useState<TeamFilter>('all')

  const { data, isLoading, isError } = useMatches({})
  const { data: predictionData } = usePredictions(1, 100)

  const allMatches = useMemo(() => data?.matches ?? [], [data])
  const teamOptions = useMemo(() => collectTeams(allMatches), [allMatches])
  const presentPhases = useMemo(() => collectPhases(allMatches), [allMatches])
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
        if (phase !== 'all' && match.phase !== phase) return false
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
    [allMatches, phase, teamId, dateFrom, dateTo, timezone],
  )

  const totalCount = data?.totalCount ?? allMatches.length

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-display-lg font-display font-semibold">Fixture</h1>
        {totalCount > 0 && (
          <p className="text-text-secondary text-body-sm">
            Los {totalCount} partidos del Mundial 2026
          </p>
        )}
      </div>

      <PhaseTabs value={phase} onChange={setPhase} phases={presentPhases} />

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
            <Skeleton key={index} className="h-28 w-full rounded-xl" />
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
  )
}
