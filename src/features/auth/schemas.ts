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

/** Username shape enforced by both the backend and this form: [a-z0-9_]{3,20}. */
export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/

export const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Ingresá tu email.')
      .email('Esto no parece un email válido.'),
    username: z
      .string()
      .min(1, 'Elegí un nombre de usuario.')
      .regex(
        USERNAME_PATTERN,
        'Entre 3 y 20 caracteres: minúsculas, números o guion bajo.',
      ),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres.')
      .regex(/\d/, 'Incluí al menos un número.'),
    passwordConfirm: z.string().min(1, 'Repetí la contraseña.'),
  })
  .refine((values) => values.password === values.passwordConfirm, {
    message: 'Las contraseñas no coinciden.',
    path: ['passwordConfirm'],
  })

export type SignupValues = z.infer<typeof signupSchema>
