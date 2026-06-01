import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { MatchTeam } from '@/features/matches/types'

/** Sentinel for "no pick" — Radix Select items can't have an empty value. */
const NONE = '__none__'

export type PodiumSpot =
  | 'championId'
  | 'runnerUpId'
  | 'thirdPlaceId'
  | 'fourthPlaceId'

const SPOTS: { key: PodiumSpot; label: string }[] = [
  { key: 'championId', label: 'Campeón' },
  { key: 'runnerUpId', label: 'Subcampeón' },
  { key: 'thirdPlaceId', label: 'Tercer puesto' },
  { key: 'fourthPlaceId', label: 'Cuarto puesto' },
]

export interface PodiumPickerProps {
  teams: MatchTeam[]
  value: Record<PodiumSpot, string | null>
  onChange: (spot: PodiumSpot, teamId: string | null) => void
  disabled?: boolean
}

/**
 * Four team selects (champion → 4th). Each select excludes the teams already
 * picked in the OTHER spots, so a team can't be chosen twice.
 */
export function PodiumPicker({
  teams,
  value,
  onChange,
  disabled,
}: PodiumPickerProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {SPOTS.map(({ key, label }) => {
        const selected = value[key]
        const takenElsewhere = new Set(
          SPOTS.filter((spot) => spot.key !== key)
            .map((spot) => value[spot.key])
            .filter((id): id is string => id !== null),
        )
        const options = teams.filter((team) => !takenElsewhere.has(team.id))
        const selectId = `podium-${key}`
        return (
          <div key={key} className="flex flex-col gap-1.5">
            <Label htmlFor={selectId}>{label}</Label>
            <Select
              value={selected ?? NONE}
              onValueChange={(next) =>
                onChange(key, next === NONE ? null : next)
              }
              disabled={disabled}
            >
              <SelectTrigger id={selectId}>
                <SelectValue placeholder="Sin definir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Sin definir</SelectItem>
                {options.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      })}
    </div>
  )
}
