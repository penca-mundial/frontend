import { useMemo, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { MatchFilters, type PhaseFilter, type TeamFilter } from '@/features/matches/components/MatchFilters'
import { MatchList } from '@/features/matches/components/MatchList'
import { useMatches } from '@/features/matches/hooks/useMatches'
import type { MatchListFilters } from '@/api/matches.api'
import type { Match, MatchTeam } from '@/features/matches/types'
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
 * Public fixture: all tournament matches, filterable by phase and date range
 * (server-side) and by team (client-side, since there is no team endpoint yet).
 * Matches are grouped by day in the user's timezone and link to the detail page.
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

  const allMatches = useMemo(() => data?.matches ?? [], [data])
  // Team options come from the full server-filtered set, so picking a team
  // doesn't shrink the option list.
  const teamOptions = useMemo(() => collectTeams(allMatches), [allMatches])
  const visibleMatches =
    teamId === 'all'
      ? allMatches
      : allMatches.filter(
          (match) =>
            match.homeTeam?.id === teamId || match.awayTeam?.id === teamId,
        )

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-display-lg font-display font-semibold">Partidos</h1>

      <MatchFilters
        phase={phase}
        onPhaseChange={setPhase}
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
            <Skeleton key={index} className="h-28 w-full rounded-lg" />
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
        <MatchList matches={visibleMatches} timezone={timezone} />
      )}
    </div>
  )
}
