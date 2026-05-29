import { z } from 'zod'

/**
 * Zod schemas for the auth forms. Types are derived with `z.infer` so the form
 * values and the schema can never drift apart.
 */

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Ingresá tu email.')
    .email('Esto no parece un email válido.'),
  password: z.string().min(1, 'Ingresá tu contraseña.'),
})

export type LoginValues = z.infer<typeof loginSchema>
