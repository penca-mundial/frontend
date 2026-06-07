import { useRef, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { TeamFlag } from '@/features/tournament-predictions/components/TeamFlag'
import type { Player } from '@/features/tournament-predictions/types'
import { cn } from '@/lib/cn'

export interface TopScorerPickerProps {
  players: Player[]
  value: string | null
  onChange: (playerId: string | null) => void
  disabled?: boolean
}

/**
 * Combobox over the full players list with client-side search (cmdk). Picking
 * the current player again clears the selection.
 */
export function TopScorerPicker({
  players,
  value,
  onChange,
  disabled,
}: TopScorerPickerProps) {
  const [open, setOpen] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const selected = players.find((player) => player.id === value) ?? null

  // cmdk re-renders the filtered items but keeps the list's previous
  // scrollTop, so after browsing down and then typing, the top match could sit
  // out of view. Reset on every query change (after cmdk paints, hence rAF).
  const scrollListToTop = () => {
    requestAnimationFrame(() => {
      if (listRef.current) listRef.current.scrollTop = 0
    })
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="top-scorer">Goleador</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="top-scorer"
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="justify-between font-normal"
          >
            <span className="flex min-w-0 items-center gap-2">
              {selected && <TeamFlag flagUrl={selected.team?.flagUrl ?? null} />}
              <span className="truncate">
                {selected ? selected.name : 'Buscá un jugador'}
              </span>
            </span>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput
              placeholder="Buscar jugador…"
              onValueChange={scrollListToTop}
            />
            <CommandList ref={listRef}>
              <CommandEmpty>Sin resultados.</CommandEmpty>
              <CommandGroup>
                {players.map((player) => (
                  <CommandItem
                    key={player.id}
                    value={`${player.name} ${player.team?.name ?? ''}`}
                    onSelect={() => {
                      onChange(player.id === value ? null : player.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2',
                        player.id === value ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <TeamFlag flagUrl={player.team?.flagUrl ?? null} />
                    <span className="truncate">{player.name}</span>
                    {player.team?.code3 && (
                      <span className="text-text-disabled text-mono-mini ml-auto">
                        {player.team.code3}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
