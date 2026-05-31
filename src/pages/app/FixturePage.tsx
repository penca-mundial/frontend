import { useMemo, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { MatchFilters, type TeamFilter } from '@/features/matches/components/MatchFilters'
import { MatchList } from '@/features/matches/components/MatchList'
import { PhaseTabs, type PhaseFilter } from '@/features/matches/components/PhaseTabs'
import { useMatches } from '@/features/matches/hooks/useMatches'
import { usePredictions } from '@/features/predictions/hooks/usePredictions'
import type { MatchListFilters } from '@/api/matches.api'
import type { Match, MatchTeam } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
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

/**
 * Public fixture: all tournament matches, filterable by phase (underlined tabs,
 * server-side) and date range (server-side), plus a client-side team filter.
 * Matches are grouped by day and predicted inline via MatchCardExpandable — the
 * user's predictions are fetched separately and joined by match id, since the
 * list endpoint doesn't embed them.
 */
export function FixturePage() {
  const { currentUser } = useCurrentUser()
  const timezone = currentUser?.timezone ?? detectUserTimezone()

  const [phase, setPhase] = useState<PhaseFilter>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [teamId, setTeamId] = useState<TeamFilter>('all')

  const serverFilters: MatchListFilters = {
    phase: phase === 'all' ? undefined : phase,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  }

  const { data, isLoading, isError } = useMatches(serverFilters)
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

  const visibleMatches =
    teamId === 'all'
      ? allMatches
      : allMatches.filter(
          (match) =>
            match.homeTeam?.id === teamId || match.awayTeam?.id === teamId,
        )

  const totalCount = data?.totalCount ?? 0

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-display-lg font-display font-semibold">Partidos</h1>
        {totalCount > 0 && (
          <p className="text-text-secondary text-body-sm">
            {totalCount} partidos del Mundial 2026
          </p>
        )}
      </div>

      <PhaseTabs value={phase} onChange={setPhase} />

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
