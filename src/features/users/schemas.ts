import { z } from 'zod'
import { USERNAME_PATTERN } from '@/features/auth/schemas'

/**
 * Profile edit schema (SCRUM-199). Username only — same `[a-z0-9_]{3,20}` rule
 * the backend and the rest of the app enforce. Timezone is intentionally absent
 * (not managed here), and there is no `@` adornment anywhere.
 */
export const profileSchema = z.object({
  username: z
    .string()
    .min(1, 'Elegí un nombre de usuario.')
    .regex(
      USERNAME_PATTERN,
      'Entre 3 y 20 caracteres: minúsculas, números o guion bajo.',
    ),
})

export type ProfileValues = z.infer<typeof profileSchema>
