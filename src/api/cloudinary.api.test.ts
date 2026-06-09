import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AvatarUploadError,
  uploadAvatar,
  MAX_AVATAR_BYTES,
} from '@/api/cloudinary.api'

function pngFile(bytes: number, type = 'image/png'): File {
  return new File([new ArrayBuffer(bytes)], 'avatar.png', { type })
}

describe('uploadAvatar', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_CLOUDINARY_CLOUD_NAME', 'demo')
    vi.stubEnv('VITE_CLOUDINARY_UPLOAD_PRESET', 'penca_unsigned')
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('rejects a non-image file before any upload', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    await expect(
      uploadAvatar(new File(['x'], 'doc.pdf', { type: 'application/pdf' })),
    ).rejects.toMatchObject({ code: 'invalid_type' })
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('rejects a file over the size limit before any upload', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    await expect(uploadAvatar(pngFile(MAX_AVATAR_BYTES + 1))).rejects.toMatchObject({
      code: 'too_large',
    })
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('fails clearly when the Cloudinary env vars are missing', async () => {
    vi.stubEnv('VITE_CLOUDINARY_CLOUD_NAME', '')
    await expect(uploadAvatar(pngFile(1024))).rejects.toMatchObject({
      code: 'not_configured',
    })
  })

  it('POSTs an unsigned upload and returns the secure_url', async () => {
    let calledUrl = ''
    let sentPreset: FormDataEntryValue | null = null
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
      calledUrl = String(url)
      sentPreset = (init?.body as FormData).get('upload_preset')
      return new Response(
        JSON.stringify({ secure_url: 'https://res.cloudinary.com/demo/x.png' }),
        { status: 200 },
      )
    })

    const url = await uploadAvatar(pngFile(2048))

    expect(calledUrl).toBe('https://api.cloudinary.com/v1_1/demo/image/upload')
    expect(sentPreset).toBe('penca_unsigned')
    expect(url).toBe('https://res.cloudinary.com/demo/x.png')
  })

  it('raises an upload_failed error on a non-2xx Cloudinary response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('nope', { status: 400 }),
    )
    await expect(uploadAvatar(pngFile(2048))).rejects.toBeInstanceOf(
      AvatarUploadError,
    )
  })
})
