import { z } from 'zod'

/**
 * The tournament prediction form: five optional ids (champion / runner-up /
 * 3rd / 4th / top scorer). Partial picks are allowed. The four podium spots
 * must be distinct teams (nulls ignored) — the UI also excludes already-picked
 * teams, and the backend enforces it too; this is the client-side backstop.
 */
export const tournamentPredictionSchema = z
  .object({
    championId: z.string().nullable(),
    runnerUpId: z.string().nullable(),
    thirdPlaceId: z.string().nullable(),
    fourthPlaceId: z.string().nullable(),
    topScorerId: z.string().nullable(),
  })
  .refine(
    (values) => {
      const podium = [
        values.championId,
        values.runnerUpId,
        values.thirdPlaceId,
        values.fourthPlaceId,
      ].filter((id): id is string => id !== null)
      return new Set(podium).size === podium.length
    },
    {
      message: 'Cada puesto del podio debe ser un equipo distinto.',
      path: ['championId'],
    },
  )

export type TournamentPredictionValues = z.infer<typeof tournamentPredictionSchema>
