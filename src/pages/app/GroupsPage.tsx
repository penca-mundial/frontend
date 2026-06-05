import { Link } from 'react-router-dom'
import { KeyRound, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionLabel } from '@/components/ui/section-label'
import { Skeleton } from '@/components/ui/skeleton'
import { GeneralPoolHero } from '@/features/groups/components/GeneralPoolHero'
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

/** Shown in the private section when the user isn't in any private penca yet. */
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

/** Two labelled sections: the general pool hero, then the private pencas. */
function GroupsSections({ groups }: { groups: Group[] }) {
  const general = groups.find((group) => group.isGeneralPool) ?? null
  const privateGroups = groups.filter((group) => !group.isGeneralPool)

  return (
    <div className="flex flex-col gap-8">
      {general && (
        <section className="flex flex-col gap-3">
          <SectionLabel as="h2" size="sm" tone="secondary" className="tracking-wide">
            POOL GENERAL
          </SectionLabel>
          <GeneralPoolHero group={general} />
        </section>
      )}

      <section className="flex flex-col gap-3">
        <SectionLabel as="h2" tone="secondary" className="tracking-wide">
          TUS PENCAS PRIVADAS
        </SectionLabel>
        {privateGroups.length > 0 ? (
          <div className="flex flex-col gap-3">
            {privateGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        ) : (
          <EmptyPrivateState />
        )}
      </section>
    </div>
  )
}

/**
 * "Pencas" — the user's groups (`GET /groups/me`). The general tournament pool
 * is a hero card, followed by the user's private pencas (each with its rank,
 * from `GET /rankings/groups/:id`). Two CTAs (create / join) sit at the top and
 * repeat in the empty state. The navbar already links here.
 */
export function GroupsPage() {
  const { data: groups, isLoading, isError } = useGroups()

  // Dynamic subtitle: "{N} privada(s) · 1 pool general". Hidden when the user
  // is only in the general pool (no private pencas yet).
  const privateCount = (groups ?? []).filter(
    (group) => !group.isGeneralPool,
  ).length
  const subtitle =
    privateCount > 0
      ? `${privateCount} ${privateCount === 1 ? 'privada' : 'privadas'} · 1 pool general`
      : null

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-lg font-display font-semibold">Pencas</h1>
          {subtitle && (
            <p className="text-text-secondary text-body-sm">{subtitle}</p>
          )}
        </div>
        <GroupCtas className="shrink-0" />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <p className="text-danger text-body">
          No pudimos cargar tus pencas. Intentá de nuevo.
        </p>
      ) : (
        <GroupsSections groups={groups ?? []} />
      )}
    </div>
  )
}
