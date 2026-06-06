import { z } from 'zod'

/**
 * Zod schema for the create-penca form. Limits mirror the backend Group model
 * (name length 3..50; description is an optional free-text column — we cap it
 * at a sensible length client-side). Types are derived with `z.infer`.
 */
export const GROUP_NAME_MIN = 3
export const GROUP_NAME_MAX = 50
export const GROUP_DESCRIPTION_MAX = 200

export const createGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(GROUP_NAME_MIN, `El nombre debe tener al menos ${GROUP_NAME_MIN} caracteres.`)
    .max(GROUP_NAME_MAX, `El nombre no puede superar los ${GROUP_NAME_MAX} caracteres.`),
  description: z
    .string()
    .trim()
    .max(
      GROUP_DESCRIPTION_MAX,
      `La descripción no puede superar los ${GROUP_DESCRIPTION_MAX} caracteres.`,
    )
    .optional(),
})

export type CreateGroupValues = z.infer<typeof createGroupSchema>

/** Invite codes are 8 uppercase alphanumerics (`Group::CODE_FORMAT`). */
export const GROUP_CODE_PATTERN = /^[A-Z0-9]{8}$/

export const joinGroupSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, 'Ingresá el código de la penca.')
    .regex(GROUP_CODE_PATTERN, 'El código son 8 caracteres (letras y números).'),
})

export type JoinGroupValues = z.infer<typeof joinGroupSchema>
