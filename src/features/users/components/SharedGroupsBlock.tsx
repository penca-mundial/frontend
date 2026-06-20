import { Badge } from '@/components/ui/badge'
import { DashboardCard } from '@/features/home/components/DashboardCard'
import type { ProfileSharedGroup } from '@/features/users/types'

export interface SharedGroupsBlockProps {
  groups: ProfileSharedGroup[]
}

/**
 * "Pencas en común": the general pool (always shared) plus the private pencas
 * the viewer and the viewed user both belong to, each with the viewed user's
 * standing. Backend orders the general pool first. Renders even when only the
 * general pool is shared.
 */
export function SharedGroupsBlock({ groups }: SharedGroupsBlockProps) {
  if (groups.length === 0) return null

  return (
    <DashboardCard title="Pencas en común">
      <ul className="divide-border divide-y">
        {groups.map((group) => (
          <li
            key={group.id}
            className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <div className="min-w-0">
              <p className="text-body-sm flex items-center gap-2 font-semibold">
                <span className="truncate">{group.name}</span>
                {group.isGeneralPool && (
                  <Badge variant="secondary" className="shrink-0">
                    General
                  </Badge>
                )}
              </p>
              <p className="text-text-secondary text-xs">
                {group.rankPosition != null
                  ? `N.º ${group.rankPosition} de ${group.total}`
                  : `${group.total} participantes`}
              </p>
            </div>
            <span className="font-display shrink-0 font-bold tabular-nums">
              {group.points}
              <span className="text-text-secondary text-xs font-normal"> pts</span>
            </span>
          </li>
        ))}
      </ul>
    </DashboardCard>
  )
}
