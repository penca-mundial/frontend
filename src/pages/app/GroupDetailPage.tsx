import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GroupDetailHeader } from '@/features/groups/components/GroupDetailHeader'
import { GroupLeaderboard } from '@/features/groups/components/GroupLeaderboard'
import { GroupMembersList } from '@/features/groups/components/GroupMembersList'
import { useGroup } from '@/features/groups/hooks/useGroup'

/** Placeholder for tabs built in follow-up tickets (Estadísticas). */
function SoonPlaceholder({ children }: { children: string }) {
  return (
    <div className="border-border bg-surface rounded-xl border border-dashed p-8 text-center">
      <p className="text-text-primary text-body font-semibold">Próximamente</p>
      <p className="text-text-secondary text-body-sm mx-auto mt-1 max-w-sm">
        {children}
      </p>
    </div>
  )
}

export function GroupDetailPage() {
  const { id } = useParams()
  const groupId = id ?? ''
  const { data: group, isLoading, isError } = useGroup(groupId)

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6" aria-busy="true">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-9 w-56 rounded-lg" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !group) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col items-start gap-4">
        <Button asChild variant="ghost" size="sm" className="text-text-secondary -ml-2">
          <Link to="/app/groups">
            <ArrowLeft aria-hidden="true" />
            Volver
          </Link>
        </Button>
        <p className="text-danger text-body">
          No pudimos cargar la penca. Puede que no exista o que no seas miembro.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <GroupDetailHeader group={group} />

      <Tabs defaultValue="ranking" className="gap-4">
        <TabsList>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
          {/* The general pool has every user — its member list adds nothing, so
              the tab is hidden there (private pencas only). */}
          {!group.isGeneralPool && (
            <TabsTrigger value="members">Miembros</TabsTrigger>
          )}
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="ranking">
          <GroupLeaderboard groupId={group.id} />
        </TabsContent>
        {!group.isGeneralPool && (
          <TabsContent value="members">
            <GroupMembersList groupId={group.id} />
          </TabsContent>
        )}
        <TabsContent value="stats">
          <SoonPlaceholder>Las estadísticas de la penca llegan pronto.</SoonPlaceholder>
        </TabsContent>
      </Tabs>
    </div>
  )
}
