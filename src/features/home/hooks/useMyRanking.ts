import { useRanking } from '@/features/rankings/hooks/useRanking'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

export interface MyRanking {
  /** The user's global position, or null until they have a ranked row. */
  position: number | null
  /** Their cumulative points, or null when unranked. */
  points: number | null
  /** Total ranked participants ("de M"), or null until the backend exposes it. */
  total: number | null
  isLoading: boolean
  isError: boolean
}

/**
 * The current user's row in the GLOBAL leaderboard (`/rankings/global` with the
 * `me` window). Shared by the dashboard header ("Vas Nº de M · X puntos") and
 * the "Tu ranking" card so both read one cached query. The `me` window is a
 * slice around the user, so we pick THEIR row by `userId` (never `me[0]`).
 */
export function useMyRanking(): MyRanking {
  const { currentUser } = useCurrentUser()
  const { me, total, isLoading, isError } = useRanking({ scope: 'global' })

  const myRow = currentUser
    ? me.find((entry) => entry.userId === currentUser.id)
    : undefined

  return {
    position: myRow?.position ?? null,
    points: myRow?.points ?? null,
    total,
    isLoading,
    isError,
  }
}
