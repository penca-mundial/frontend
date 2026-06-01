import { HomeTournamentPredictionCard } from '@/features/tournament-predictions/components/HomeTournamentPredictionCard'

/**
 * Home / dashboard shell. For now it hosts the single dashboard card buildable
 * today — the tournament prediction. The rest of the dashboard (ranking,
 * pencas, live match) depends on later phases and arrives in their tickets.
 */
export function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <h1 className="text-display-lg font-display font-semibold">Inicio</h1>
      <HomeTournamentPredictionCard />
    </div>
  )
}
