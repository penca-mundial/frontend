import { formatThousands } from '@/lib/format'
import type { Group } from '@/types/domain'
import { cn } from '@/lib/cn'

/** The general pool maps to the global ranking endpoint, not a group one. */
export const GLOBAL_SCOPE = 'global'

export interface PoolTabsProps {
  /** The user's pencas (`GET /groups/me`): general pool + private groups. */
  groups: Group[]
  /** `'global'` for the general pool, or a private group id. */
  value: string
  onChange: (value: string) => void
}

function Pill({
  label,
  count,
  selected,
  onClick,
}: {
  label: string
  count: number
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-body-sm font-medium whitespace-nowrap transition-colors',
        selected
          ? 'border-brand-primary bg-brand-primary text-white'
          : 'border-border bg-surface text-text-primary hover:border-brand-primary/40',
      )}
    >
      {label}
      <span
        className={cn(
          'text-xs font-normal tabular-nums',
          selected ? 'text-white/70' : 'text-text-secondary',
        )}
      >
        {formatThousands(count)}
      </span>
    </button>
  )
}

/**
 * The penca switcher for the rankings page: a horizontal, mobile-scrollable
 * row of pills — "Pool general" always first (→ the global ranking), then the
 * user's private pencas (→ their group rankings). Each pill shows the member
 * count.
 */
export function PoolTabs({ groups, value, onChange }: PoolTabsProps) {
  const general = groups.find((group) => group.isGeneralPool) ?? null
  const privateGroups = groups.filter((group) => !group.isGeneralPool)

  return (
    <div
      role="group"
      aria-label="Elegí la penca"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
    >
      {general && (
        <Pill
          label="Pool general"
          count={general.memberCount}
          selected={value === GLOBAL_SCOPE}
          onClick={() => onChange(GLOBAL_SCOPE)}
        />
      )}
      {privateGroups.map((group) => (
        <Pill
          key={group.id}
          label={group.name}
          count={group.memberCount}
          selected={value === group.id}
          onClick={() => onChange(group.id)}
        />
      ))}
    </div>
  )
}
