import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AvatarUploader } from '@/features/users/components/AvatarUploader'
import { AvatarUploadError } from '@/api/cloudinary.api'

vi.mock('@/api/cloudinary.api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/cloudinary.api')>()
  return { ...actual, uploadAvatar: vi.fn() }
})
vi.mock('@/features/users/hooks/useUpdateProfile', () => ({
  useUpdateProfile: vi.fn(),
}))
vi.mock('@/hooks/useToast', () => ({ toast: vi.fn() }))

import { uploadAvatar } from '@/api/cloudinary.api'
import { useUpdateProfile } from '@/features/users/hooks/useUpdateProfile'
import { toast } from '@/hooks/useToast'

const uploadAvatarMock = vi.mocked(uploadAvatar)
const useUpdateProfileMock = vi.mocked(useUpdateProfile)
const toastMock = vi.mocked(toast)

let mutateAsync: ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()
  mutateAsync = vi.fn().mockResolvedValue({})
  useUpdateProfileMock.mockReturnValue({
    mutateAsync,
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateProfile>)
})

const file = (type = 'image/png') =>
  new File([new ArrayBuffer(1024)], 'a.png', { type })

describe('AvatarUploader', () => {
  it('shows initials when there is no avatar', () => {
    render(<AvatarUploader avatarUrl={null} username="santi" email="s@p.dev" />)
    expect(screen.getByText('SA')).toBeInTheDocument()
  })

  it('renders the photo when an avatar url is present', () => {
    render(
      <AvatarUploader
        avatarUrl="https://cdn/9.png"
        username="santi"
        email="s@p.dev"
      />,
    )
    expect(document.querySelector('img')).toHaveAttribute(
      'src',
      'https://cdn/9.png',
    )
  })

  it('uploads the chosen file and persists the returned url via PATCH', async () => {
    const user = userEvent.setup()
    uploadAvatarMock.mockResolvedValue('https://res.cloudinary.com/x.png')
    render(<AvatarUploader avatarUrl={null} username="santi" email="s@p.dev" />)

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement
    await user.upload(input, file())

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        avatarUrl: 'https://res.cloudinary.com/x.png',
      }),
    )
    expect(toastMock).toHaveBeenCalledWith({
      title: 'Foto de perfil actualizada',
    })
  })

  it('surfaces a validation error as a toast and never saves', async () => {
    const user = userEvent.setup()
    uploadAvatarMock.mockRejectedValue(
      new AvatarUploadError('too_large', 'La imagen no puede superar los 5 MB.'),
    )
    render(<AvatarUploader avatarUrl={null} username="santi" email="s@p.dev" />)

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement
    await user.upload(input, file())

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith({
        title: 'La imagen no puede superar los 5 MB.',
        variant: 'destructive',
      }),
    )
    expect(mutateAsync).not.toHaveBeenCalled()
  })
})
