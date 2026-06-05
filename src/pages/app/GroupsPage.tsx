import { Link } from 'react-router-dom'
import { KeyRound, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { GroupCard } from '@/features/groups/components/GroupCard'
import { useGroups } from '@/features/groups/hooks/useGroups'
import type { Group } from '@/types/domain'
import { cn } from '@/lib/cn'

/** The two primary actions, reused at the top and in the empty state. */
function GroupCtas({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2 sm:flex-row', className)}>
      <Button asChild>
        <Link to="/app/groups/new">
          <Plus aria-hidden="true" />
          Crear penca
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link to="/app/groups/join">
          <KeyRound aria-hidden="true" />
          Unirme con código
        </Link>
      </Button>
    </div>
  )
}

/** Shown below the general pool when the user isn't in any private penca yet. */
function EmptyPrivateState() {
  return (
    <div className="border-border bg-surface rounded-xl border border-dashed p-8 text-center">
      <p className="text-text-primary text-body font-semibold">
        Todavía no estás en ninguna penca privada
      </p>
      <p className="text-text-secondary text-body-sm mx-auto mt-1 max-w-sm">
        Creá una penca para competir con tus amigos, o unite a una con su código
        de invitación.
      </p>
      <GroupCtas className="mt-4 sm:justify-center" />
    </div>
  )
}

/** The list itself: groups in backend order (general pool first), plus the
 *  empty state when the user has no private pencas. */
function GroupsList({ groups }: { groups: Group[] }) {
  const hasPrivate = groups.some((group) => !group.isGeneralPool)
  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
      {!hasPrivate && <EmptyPrivateState />}
    </div>
  )
}

/**
 * "Pencas" — the user's groups (`GET /groups/me`). The general tournament pool
 * is listed first (highlighted), followed by their private pencas. Two CTAs
 * (create / join by code) sit at the top and repeat in the empty state. The
 * navbar already links here; this page does not add an item.
 */
export function GroupsPage() {
  const { data: groups, isLoading, isError } = useGroups()

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-lg font-display font-semibold">Pencas</h1>
          <p className="text-text-secondary text-body-sm">
            Competí con tus amigos en pencas privadas.
          </p>
        </div>
        <GroupCtas className="shrink-0" />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[72px] w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-danger text-body">
          No pudimos cargar tus pencas. Intentá de nuevo.
        </p>
      ) : (
        <GroupsList groups={groups ?? []} />
      )}
    </div>
  )
}
