import { BrandSurface } from '@/components/brand/BrandSurface'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useTournament } from '@/features/tournament-predictions/hooks/useTournament'
import { useMyRanking } from '@/features/home/hooks/useMyRanking'
import { tournamentProgress } from '@/features/home/utils'
import { formatThousands } from '@/lib/format'

/** "Día N de 39", or "Día N" when the tournament end date isn't known yet. */
function dayLabel(day: number, total: number | null): string {
  return total ? `Día ${day} de ${total}` : `Día ${day}`
}

/**
 * Dashboard greeting hero (teal surface, white text): "Hola {username}", the
 * tournament day, and the user's global standing ("Vas Nº de M · X puntos").
 * Each segment degrades independently — the day hides until the tournament
 * loads, and the standing hides until the user has a ranked row — so the header
 * is useful even before Rankings (Phase 7) data is in.
 */
export function HomeHeader() {
  const { currentUser } = useCurrentUser()
  const tournamentQuery = useTournament()
  const { position, points, total } = useMyRanking()

  const tournament = tournamentQuery.data
  const progress = tournament
    ? tournamentProgress(tournament.startsAt, tournament.endsAt)
    : null

  const name = currentUser?.username ?? 'jugador'

  const segments: string[] = []
  if (progress) segments.push(dayLabel(progress.day, progress.total))
  if (position != null) {
    const place = total ? `Vas Nº ${position} de ${formatThousands(total)}` : `Vas Nº ${position}`
    segments.push(place)
  }
  if (points != null) segments.push(`${formatThousands(points)} puntos`)

  return (
    <BrandSurface className="shadow-sm">
      <div className="flex flex-col gap-1 p-5">
        <h1 className="font-display text-display-md font-semibold">
          Hola, {name}
        </h1>
        {segments.length > 0 && (
          <p className="text-body-sm text-white/85">{segments.join(' · ')}</p>
        )}
      </div>
    </BrandSurface>
  )
}
