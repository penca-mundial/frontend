import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { RankingWindow } from '@/api/rankings.api'
import { useGroups } from '@/features/groups/hooks/useGroups'
import { Leaderboard } from '@/features/rankings/components/Leaderboard'
import { MyPositionBlock } from '@/features/rankings/components/MyPositionBlock'
import { GLOBAL_SCOPE, PoolTabs } from '@/features/rankings/components/PoolTabs'
import { useRanking } from '@/features/rankings/hooks/useRanking'

const WINDOW_TABS: { value: RankingWindow; label: string }[] = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Semana' },
  { value: 'total', label: 'Total' },
]

function isRankingWindow(value: string): value is RankingWindow {
  return WINDOW_TABS.some((tab) => tab.value === value)
}

/**
 * "Ranking" — the leaderboards across every penca the user is in. A pill row
 * switches the scope (the general pool → global ranking, a private penca →
 * its group ranking); Hoy / Semana / Total switch the scoring window. The
 * user's own position sits on the textured teal card, sticky on mobile.
 * Evolution chart + historical picker arrive with SCRUM-286.
 */
export function RankingsPage() {
  const { data: groups, isLoading: groupsLoading } = useGroups()
  const [scope, setScope] = useState<string>(GLOBAL_SCOPE)
  // Named rankingWindow (not `window`) to avoid shadowing the browser global.
  const [rankingWindow, setRankingWindow] = useState<RankingWindow>('total')

  const ranking = useRanking({
    scope: scope === GLOBAL_SCOPE ? 'global' : { groupId: scope },
    window: rankingWindow,
  })
  const { entries, me } = ranking

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      <h1 className="text-display-md font-display font-semibold">Ranking</h1>

      {groupsLoading ? (
        <div className="flex gap-2" aria-busy="true">
          <Skeleton className="h-9 w-36 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      ) : (
        <PoolTabs groups={groups ?? []} value={scope} onChange={setScope} />
      )}

      <MyPositionBlock
        entries={entries}
        me={me}
        isLoading={ranking.isLoading}
      />

      <Tabs
        value={rankingWindow}
        onValueChange={(value) => {
          if (isRankingWindow(value)) setRankingWindow(value)
        }}
        className="gap-4"
      >
        <TabsList>
          {WINDOW_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {/* One panel tracks the active window: the data refetches per window,
            the markup stays the same. */}
        <TabsContent value={rankingWindow}>
          <Leaderboard
            entries={entries}
            me={me}
            isLoading={ranking.isLoading}
            isError={ranking.isError}
            hasMore={ranking.hasMore}
            onLoadMore={ranking.loadMore}
            isLoadingMore={ranking.isLoadingMore}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
