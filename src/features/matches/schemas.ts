import { z } from 'zod'

/** A single score: integer 0–20, matching the backend `Prediction` validation. */
const scoreSchema = z
  .number({ message: 'Ingresá un número.' })
  .int('Tiene que ser un número entero.')
  .min(0, 'No puede ser negativo.')
  .max(20, 'El máximo es 20.')

export interface PredictionValues {
  homeScore: number
  awayScore: number
  advancingTeamId: string | null
}

/**
 * Prediction form schema. Knockout matches additionally require picking the
 * advancing team (the backend rejects a knockout prediction without one), so
 * the rule is parameterised on `knockout`.
 */
export function predictionSchema(knockout: boolean) {
  return z
    .object({
      homeScore: scoreSchema,
      awayScore: scoreSchema,
      advancingTeamId: z.string().nullable(),
    })
    .refine((values) => !knockout || values.advancingTeamId !== null, {
      message: 'Elegí qué equipo pasa de ronda.',
      path: ['advancingTeamId'],
    })
}
