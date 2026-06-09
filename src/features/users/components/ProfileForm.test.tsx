import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProfileForm } from '@/features/users/components/ProfileForm'

vi.mock('@/features/users/hooks/useUpdateProfile', () => ({
  useUpdateProfile: vi.fn(),
}))
vi.mock('@/api/auth.api', () => ({ getApiError: vi.fn() }))
vi.mock('@/hooks/useToast', () => ({ toast: vi.fn() }))

import { useUpdateProfile } from '@/features/users/hooks/useUpdateProfile'
import { getApiError } from '@/api/auth.api'
import { toast } from '@/hooks/useToast'

const useUpdateProfileMock = vi.mocked(useUpdateProfile)
const getApiErrorMock = vi.mocked(getApiError)
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

describe('ProfileForm', () => {
  it('pre-fills the current username and shows no "@" adornment', () => {
    render(<ProfileForm username="santi" />)
    expect(screen.getByLabelText('Nombre de usuario')).toHaveValue('santi')
    // The whole form must not render an "@" prefix/adornment anywhere.
    expect(screen.queryByText('@')).not.toBeInTheDocument()
  })

  it('blocks an invalid username (regex) without calling the API', async () => {
    const user = userEvent.setup()
    render(<ProfileForm username="santi" />)

    const input = screen.getByLabelText('Nombre de usuario')
    await user.clear(input)
    await user.type(input, 'AB') // uppercase + too short
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(
      await screen.findByText(/Entre 3 y 20 caracteres/),
    ).toBeInTheDocument()
    expect(mutateAsync).not.toHaveBeenCalled()
  })

  it('saves a valid username via PATCH and toasts success', async () => {
    const user = userEvent.setup()
    render(<ProfileForm username="santi" />)

    const input = screen.getByLabelText('Nombre de usuario')
    await user.clear(input)
    await user.type(input, 'santi_10')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(mutateAsync).toHaveBeenCalledWith({ username: 'santi_10' })
    expect(toastMock).toHaveBeenCalledWith({ title: 'Perfil actualizado' })
  })

  it('maps a taken username (422) back onto the field, not a toast', async () => {
    const user = userEvent.setup()
    mutateAsync.mockRejectedValueOnce(new Error('taken'))
    getApiErrorMock.mockReturnValue({
      code: 'username_already_set',
      message: 'x',
    } as unknown as ReturnType<typeof getApiError>)
    render(<ProfileForm username="santi" />)

    const input = screen.getByLabelText('Nombre de usuario')
    await user.clear(input)
    await user.type(input, 'taken_one')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(
      await screen.findByText('Ese nombre de usuario ya está en uso.'),
    ).toBeInTheDocument()
    expect(toastMock).not.toHaveBeenCalled()
  })
})
