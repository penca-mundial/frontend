import { ResultCard } from '@/features/home/components/ResultCard'
import { useRecentFinishedMatches } from '@/features/home/hooks/useRecentFinishedMatches'

/**
 * The dashboard's recent results: up to three finished-match cards (most recent
 * first), each coloured by its outcome category, the first carrying the "Último
 * resultado" eyebrow. Renders nothing — no empty state — while loading or when
 * there are no finished matches yet.
 */
export function RecentResults() {
  const { matches, isLoading } = useRecentFinishedMatches()

  if (isLoading || matches.length === 0) return null

  return (
    <div className="flex flex-col gap-6">
      {matches.slice(0, 3).map((match, index) => (
        <ResultCard key={match.id} match={match} showEyebrow={index === 0} />
      ))}
    </div>
  )
}
