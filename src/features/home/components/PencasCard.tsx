import { Link } from 'react-router-dom'
import { ChevronRight, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardCard } from '@/features/home/components/DashboardCard'
import { useGroups } from '@/features/groups/hooks/useGroups'
import { useGroupRank } from '@/features/groups/hooks/useGroupRank'
import { formatThousands } from '@/lib/format'
import type { Group } from '@/types/domain'

/** One penca row: name + the user's "Nº de M" standing, linking to its detail. */
function PencaRow({ group }: { group: Group }) {
  const { rankPosition, isLoading } = useGroupRank(group.id)

  return (
    <Link
      to={`/app/groups/${group.id}`}
      className="hover:bg-surface-muted focus-visible:ring-ring -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate text-body font-medium">{group.name}</span>
        {group.isOwner && (
          <Badge variant="outline" className="shrink-0 text-[10px]">
            Creador
          </Badge>
        )}
      </div>
      <span className="text-text-secondary shrink-0 text-body-sm tabular-nums">
        {isLoading ? (
          <span className="bg-surface-muted inline-block h-4 w-12 animate-pulse rounded" />
        ) : rankPosition != null ? (
          <>
            <span className="text-text-primary font-semibold">{rankPosition}º</span> de{' '}
            {formatThousands(group.memberCount)}
          </>
        ) : (
          `${formatThousands(group.memberCount)} jugadores`
        )}
      </span>
      <ChevronRight aria-hidden="true" className="text-text-disabled size-4 shrink-0" />
    </Link>
  )
}

/**
 * "Tus pencas": the user's PRIVATE pencas with their standing in each
 * ("3º de 14"), plus a "Nueva" action. The general tournament pool
 * (`isGeneralPool`) is excluded here — it has its own hero elsewhere. The
 * per-group rank comes from one `useGroupRank` query per row
 * (cached/parallelised). Degrades to member counts if a rank isn't available.
 */
export function PencasCard() {
  const { data: groups, isLoading } = useGroups()
  const pencas = (groups ?? []).filter((group) => !group.isGeneralPool)

  return (
    <DashboardCard title="Tus pencas">
      {isLoading ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      ) : pencas.length > 0 ? (
        <div className="flex flex-col">
          {pencas.map((group) => (
            <PencaRow key={group.id} group={group} />
          ))}
        </div>
      ) : (
        <p className="text-text-secondary text-body-sm">
          Todavía no estás en ninguna penca.
        </p>
      )}

      <Link
        to="/app/groups/new"
        className="text-brand-primary focus-visible:ring-ring inline-flex items-center gap-1 self-start rounded-sm text-body-sm font-medium focus-visible:ring-2 focus-visible:outline-none"
      >
        <Plus aria-hidden="true" className="size-4" />
        Nueva
      </Link>
    </DashboardCard>
  )
}
