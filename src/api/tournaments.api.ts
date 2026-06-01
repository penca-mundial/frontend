import { get } from '@/api/client'
import type { TournamentResponse } from '@/types/api'
import type { Tournament } from '@/features/tournament-predictions/types'

const idOrNull = (value: number | null): string | null =>
  value === null ? null : String(value)

/** Map the backend (snake_case) tournament to the domain type. */
function mapTournament(tournament: TournamentResponse): Tournament {
  return {
    id: String(tournament.id),
    name: tournament.name,
    startsAt: tournament.starts_at,
    endsAt: tournament.ends_at,
    externalCode: tournament.external_code,
    championId: idOrNull(tournament.champion_id),
    runnerUpId: idOrNull(tournament.runner_up_id),
    thirdPlaceId: idOrNull(tournament.third_place_id),
    fourthPlaceId: idOrNull(tournament.fourth_place_id),
    topScorerId: idOrNull(tournament.top_scorer_id),
    isLocked: tournament.is_locked,
    secondsUntilKickoff: tournament.seconds_until_kickoff,
  }
}

export const tournamentsApi = {
  /** The canonical current tournament (`GET /tournaments/current`). */
  async current(): Promise<Tournament> {
    return mapTournament(await get<TournamentResponse>('/tournaments/current'))
  },
}
