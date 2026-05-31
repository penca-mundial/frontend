import type { MatchPhase } from '@/features/matches/types'
import { PHASE_LABELS } from '@/features/matches/utils'
import { cn } from '@/lib/cn'

export type PhaseFilter = MatchPhase | 'all'

export interface PhaseTabsProps {
  value: PhaseFilter
  onChange: (value: PhaseFilter) => void
  /**
   * Phases that have at least one match, in tournament order. A phase tab is
   * only shown when its phase is present here, so the user never lands on an
   * empty list (e.g. knockout tabs stay hidden until those matches are seeded).
   */
  phases: MatchPhase[]
}

/** Underlined tab bar for filtering the fixture by phase. */
export function PhaseTabs({ value, onChange, phases }: PhaseTabsProps) {
  const tabs: { value: PhaseFilter; label: string }[] = [
    { value: 'all', label: 'Todas' },
    ...phases.map((phase) => ({ value: phase, label: PHASE_LABELS[phase] })),
  ]

  return (
    <div
      role="tablist"
      aria-label="Filtrar por fase"
      className="border-border flex gap-1 overflow-x-auto border-b"
    >
      {tabs.map((tab) => {
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
