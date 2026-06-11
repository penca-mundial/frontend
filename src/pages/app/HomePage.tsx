import { HomeHeader } from '@/features/home/components/HomeHeader'
import { NowMatchCard } from '@/features/home/components/NowMatchCard'
import { LastResultCard } from '@/features/home/components/LastResultCard'
import { RankingCard } from '@/features/home/components/RankingCard'
import { PencasCard } from '@/features/home/components/PencasCard'
import { HomeTournamentPredictionCard } from '@/features/tournament-predictions/components/HomeTournamentPredictionCard'

/**
 * Home / dashboard (`/app/home`). The mock grid: a greeting hero on top, then a
 * two-column layout — match activity on the left (live/next + last result) and
 * a sidebar of standings cards on the right (ranking, tournament prediction,
 * pencas). Single column on mobile. Each card fetches and degrades on its own,
 * so the page renders progressively as Phase 6/7 data and the new match
 * endpoints come online.
 */
export function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <HomeHeader />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <NowMatchCard />
          <LastResultCard />
        </div>
        <div className="flex flex-col gap-6">
          <RankingCard />
          <HomeTournamentPredictionCard />
          <PencasCard />
        </div>
      </div>
    </div>
  )
}
