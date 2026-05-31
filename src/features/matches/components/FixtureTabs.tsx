import { cn } from '@/lib/cn'

export type FixtureTab = 'calendario' | 'grupos' | 'eliminacion'

const TABS: { value: FixtureTab; label: string }[] = [
  { value: 'calendario', label: 'Calendario' },
  { value: 'grupos', label: 'Grupos' },
  { value: 'eliminacion', label: 'Eliminación' },
]

export interface FixtureTabsProps {
  value: FixtureTab
  onChange: (value: FixtureTab) => void
}

/** Segmented control switching the fixture between its three views. */
export function FixtureTabs({ value, onChange }: FixtureTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Vista del fixture"
      className="bg-surface-muted inline-flex w-fit gap-1 rounded-full p-1"
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
              'rounded-full px-4 py-1.5 text-body-sm font-medium transition-colors',
              selected
                ? 'bg-surface text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
