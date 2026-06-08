import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GroupDetailHeader } from '@/features/groups/components/GroupDetailHeader'
import { GroupMembersList } from '@/features/groups/components/GroupMembersList'
import { useGroup } from '@/features/groups/hooks/useGroup'
import { Leaderboard } from '@/features/rankings/components/Leaderboard'
import { PencaStats } from '@/features/rankings/components/PencaStats'
import { useRanking } from '@/features/rankings/hooks/useRanking'

export function GroupDetailPage() {
  const { id } = useParams()
  const groupId = id ?? ''
  const { data: group, isLoading, isError } = useGroup(groupId)
  // The detail's Ranking tab shows the cumulative table (windows live in
  // /app/rankings). Fetched here so the tab content stays presentational.
  const ranking = useRanking({ scope: { groupId } })

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
          <Leaderboard
            entries={ranking.entries}
            me={ranking.me}
            isLoading={ranking.isLoading}
            isError={ranking.isError}
            hasMore={ranking.hasMore}
            onLoadMore={ranking.loadMore}
            isLoadingMore={ranking.isLoadingMore}
          />
        </TabsContent>
        {!group.isGeneralPool && (
          <TabsContent value="members">
            <GroupMembersList groupId={group.id} />
          </TabsContent>
        )}
        <TabsContent value="stats">
          <PencaStats groupId={group.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
