import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { MatchPhase, MatchTeam } from '@/features/matches/types'
import { PHASE_LABELS } from '@/features/matches/utils'
import { cn } from '@/lib/cn'

export type PhaseFilter = MatchPhase | 'all'
export type TeamFilter = string | 'all'

export interface MatchFiltersProps {
  phase: PhaseFilter
  onPhaseChange: (phase: PhaseFilter) => void
  dateFrom: string
  dateTo: string
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
  teamId: TeamFilter
  teamOptions: MatchTeam[]
  onTeamChange: (value: TeamFilter) => void
}

const PHASE_CHIPS: { value: PhaseFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  ...(Object.keys(PHASE_LABELS) as MatchPhase[]).map((phase) => ({
    value: phase,
    label: PHASE_LABELS[phase],
  })),
]

/**
 * Fixture filters: a phase chip selector, a kickoff date range and a team
 * picker. Controlled — the page owns the state and decides which filters apply
 * server-side (phase, date) vs client-side (team).
 */
export function MatchFilters({
  phase,
  onPhaseChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  teamId,
  teamOptions,
  onTeamChange,
}: MatchFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <div
        role="group"
        aria-label="Filtrar por fase"
        className="flex flex-wrap gap-2"
      >
        {PHASE_CHIPS.map((chip) => {
          const selected = phase === chip.value
          return (
            <button
              key={chip.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onPhaseChange(chip.value)}
              className={cn(
                'rounded-full border px-3 py-1 text-body-sm font-medium transition-colors',
                selected
                  ? 'border-brand-primary bg-brand-primary text-white'
                  : 'border-border text-text-secondary hover:bg-surface-muted',
              )}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

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
    </div>
  )
}
