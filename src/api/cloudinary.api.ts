/** Max avatar size accepted before upload (5 MB). The preset enforces the rest (format/crop) server-side. */
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024

export type AvatarUploadErrorCode =
  | 'invalid_type'
  | 'too_large'
  | 'not_configured'
  | 'upload_failed'

/** Typed failure so the UI can map a clear Spanish message per cause. */
export class AvatarUploadError extends Error {
  code: AvatarUploadErrorCode
  constructor(code: AvatarUploadErrorCode, message: string) {
    super(message)
    this.name = 'AvatarUploadError'
    this.code = code
  }
}

/**
 * Upload an avatar to Cloudinary via an UNSIGNED preset and return the hosted
 * `secure_url` (SCRUM-199). Client-side guards (image/*, ≤5 MB) fail fast before
 * any network call; the preset owns the rest (allowed formats, transforms,
 * crop). Uses `fetch` directly — Cloudinary is a third-party origin, so this
 * must NOT go through the app's credentialed axios client. Env (baked at build):
 * `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`.
 */
export async function uploadAvatar(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new AvatarUploadError(
      'invalid_type',
      'El archivo tiene que ser una imagen.',
    )
  }
  if (file.size > MAX_AVATAR_BYTES) {
    throw new AvatarUploadError(
      'too_large',
      'La imagen no puede superar los 5 MB.',
    )
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  if (!cloudName || !uploadPreset) {
    throw new AvatarUploadError(
      'not_configured',
      'La carga de imágenes no está disponible por ahora.',
    )
  }

  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', uploadPreset)

  let response: Response
  try {
    response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: form },
    )
  } catch {
    throw new AvatarUploadError(
      'upload_failed',
      'No pudimos subir la imagen. Probá de nuevo.',
    )
  }

  if (!response.ok) {
    throw new AvatarUploadError(
      'upload_failed',
      'No pudimos subir la imagen. Probá de nuevo.',
    )
  }

  const data = (await response.json()) as { secure_url?: string }
  if (!data.secure_url) {
    throw new AvatarUploadError(
      'upload_failed',
      'No pudimos subir la imagen. Probá de nuevo.',
    )
  }
  return data.secure_url
}
