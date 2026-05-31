import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { MatchTeam } from '@/features/matches/types'

export type TeamFilter = string | 'all'

export interface MatchFiltersProps {
  dateFrom: string
  dateTo: string
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
  teamId: TeamFilter
  teamOptions: MatchTeam[]
  onTeamChange: (value: TeamFilter) => void
}

/**
 * Secondary fixture filters: a kickoff date range and a team picker. The phase
 * filter lives in the underlined tab bar above. Date filters apply server-side;
 * the team filter applies client-side (no team endpoint yet).
 */
export function MatchFilters({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  teamId,
  teamOptions,
  onTeamChange,
}: MatchFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="match-date-from">Desde</Label>
        <Input
          id="match-date-from"
          type="date"
          value={dateFrom}
          onChange={(event) => onDateFromChange(event.target.value)}
          className="w-auto"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="match-date-to">Hasta</Label>
        <Input
          id="match-date-to"
          type="date"
          value={dateTo}
          onChange={(event) => onDateToChange(event.target.value)}
          className="w-auto"
        />
      </div>
      <div className="flex min-w-48 flex-col gap-1">
        <Label htmlFor="match-team">Equipo</Label>
        <Select value={teamId} onValueChange={onTeamChange}>
          <SelectTrigger id="match-team">
            <SelectValue placeholder="Todos los equipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los equipos</SelectItem>
            {teamOptions.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
