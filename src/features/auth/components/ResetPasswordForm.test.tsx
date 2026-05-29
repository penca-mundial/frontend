import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/api/auth.api', () => ({
  authApi: { resetPassword: vi.fn() },
  getApiError: vi.fn(),
}))

import { authApi, getApiError } from '@/api/auth.api'

const resetPassword = vi.mocked(authApi.resetPassword)
const getApiErrorMock = vi.mocked(getApiError)

function renderForm(token: string | null) {
  return render(
    <MemoryRouter>
      <ResetPasswordForm token={token} />
    </MemoryRouter>,
  )
}

async function fillPasswords(
  user: ReturnType<typeof userEvent.setup>,
  value = 'brandnew123',
) {
  await user.type(screen.getByLabelText('Nueva contraseña'), value)
  await user.type(screen.getByLabelText('Repetí la nueva contraseña'), value)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ResetPasswordForm', () => {
  it('shows the invalid-link notice when there is no token', () => {
    renderForm(null)
    expect(screen.getByText('Este enlace ya no sirve')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Pedir un nuevo enlace' }),
    ).toBeInTheDocument()
  })

  it('resets the password and redirects to login on success', async () => {
    const user = userEvent.setup()
    resetPassword.mockResolvedValueOnce({
      id: 'u1',
      email: 'sosa@example.com',
      username: 'sosa',
      isAdmin: false,
      avatarUrl: null,
      timezone: null,
      confirmedAt: '2026-01-01T00:00:00Z',
      needsUsername: false,
    })
    renderForm('tok-123')

    await fillPasswords(user)
    await user.click(screen.getByRole('button', { name: 'Guardar contraseña' }))

    await waitFor(() =>
      expect(resetPassword).toHaveBeenCalledWith({
        reset_password_token: 'tok-123',
        password: 'brandnew123',
      }),
    )
    expect(mockNavigate).toHaveBeenCalledWith('/login?reset=success', {
      replace: true,
    })
  })

  it('shows the invalid-link notice when the token is expired', async () => {
    const user = userEvent.setup()
    resetPassword.mockRejectedValueOnce(new Error('400'))
    getApiErrorMock.mockReturnValue({
      code: 'token_expired',
      message: 'El enlace expiró.',
    })
    renderForm('old-token')

    await fillPasswords(user)
    await user.click(screen.getByRole('button', { name: 'Guardar contraseña' }))

    expect(
      await screen.findByText('Este enlace ya no sirve'),
    ).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('blocks mismatched passwords client-side', async () => {
    const user = userEvent.setup()
    renderForm('tok-123')

    await user.type(screen.getByLabelText('Nueva contraseña'), 'brandnew123')
    await user.type(
      screen.getByLabelText('Repetí la nueva contraseña'),
      'different999',
    )
    await user.click(screen.getByRole('button', { name: 'Guardar contraseña' }))

    expect(
      await screen.findByText('Las contraseñas no coinciden.'),
    ).toBeInTheDocument()
    expect(resetPassword).not.toHaveBeenCalled()
  })
})
