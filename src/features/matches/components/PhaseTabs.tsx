import type { MatchPhase } from '@/features/matches/types'
import { KNOCKOUT_ROUND_ORDER, PHASE_LABELS } from '@/features/matches/utils'
import { cn } from '@/lib/cn'

export type PhaseFilter = MatchPhase | 'all'

const TABS: { value: PhaseFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'group_stage', label: PHASE_LABELS.group_stage },
  ...KNOCKOUT_ROUND_ORDER.map((phase) => ({
    value: phase,
    label: PHASE_LABELS[phase],
  })),
]

export interface PhaseTabsProps {
  value: PhaseFilter
  onChange: (value: PhaseFilter) => void
}

/** Underlined tab bar for filtering the fixture by phase. */
export function PhaseTabs({ value, onChange }: PhaseTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filtrar por fase"
      className="border-border flex gap-1 overflow-x-auto border-b"
    >
      {TABS.map((tab) => {
        const selected = value === tab.value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative shrink-0 px-3.5 py-2.5 text-body-sm font-medium transition-colors',
              selected
                ? 'text-text-primary'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {tab.label}
            {selected && (
              <span className="bg-brand-primary absolute right-3.5 bottom-0 left-3.5 h-0.5 rounded-sm" />
            )}
          </button>
        )
      })}
    </div>
  )
}
