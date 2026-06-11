import { BrandSurface } from '@/components/brand/BrandSurface'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useTournament } from '@/features/tournament-predictions/hooks/useTournament'
import { tournamentProgress } from '@/features/home/utils'

/** "Día N de 39", or "Día N" when the tournament end date isn't known yet. */
function dayLabel(day: number, total: number | null): string {
  return total ? `Día ${day} de ${total}` : `Día ${day}`
}

/**
 * Dashboard greeting hero (teal surface, white text): "Hola, {username}!" with a
 * small label line below — "Día N de 39 · {tournament}". The standing lives in
 * the "Tu ranking" card, not here. The label line hides until the tournament
 * loads, so the header is useful immediately.
 */
export function HomeHeader() {
  const { currentUser } = useCurrentUser()
  const tournamentQuery = useTournament()

  const tournament = tournamentQuery.data
  const progress = tournament
    ? tournamentProgress(tournament.startsAt, tournament.endsAt)
    : null

  const name = currentUser?.username ?? 'jugador'

  return (
    <BrandSurface className="shadow-sm">
      <div className="flex flex-col gap-1 p-5">
        <h1 className="font-display text-display-md font-semibold">
          Hola, {name}!
        </h1>
        {progress && tournament && (
          <p className="text-[11px] font-semibold tracking-wide text-white/85 uppercase">
            {dayLabel(progress.day, progress.total)} · {tournament.name}
          </p>
        )}
      </div>
    </BrandSurface>
  )
}
