import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginForm } from '@/features/auth/components/LoginForm'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockRefetch = vi.fn()
vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({
    currentUser: null,
    isLoading: false,
    refetch: mockRefetch,
    logout: vi.fn(),
  }),
}))

vi.mock('@/api/auth.api', () => ({
  authApi: { login: vi.fn(), resendConfirmation: vi.fn() },
  getApiError: vi.fn(),
}))

// Imported after the mock so these are the mocked implementations.
import { authApi, getApiError } from '@/api/auth.api'

const login = vi.mocked(authApi.login)
const resendConfirmation = vi.mocked(authApi.resendConfirmation)
const getApiErrorMock = vi.mocked(getApiError)

function renderForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>,
  )
}

async function fillCredentials(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Email'), 'sosa@example.com')
  await user.type(screen.getByLabelText('Contraseña'), 'secret123')
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LoginForm', () => {
  it('renders the email and password fields', () => {
    renderForm()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeInTheDocument()
  })

  it('blocks empty submissions with field-level validation', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('Ingresá tu email.')).toBeInTheDocument()
    expect(screen.getByText('Ingresá tu contraseña.')).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })

  it('logs in, refetches the session and navigates home on success', async () => {
    const user = userEvent.setup()
    login.mockResolvedValueOnce({
      id: 'u1',
      email: 'sosa@example.com',
      username: 'sosa',
      isAdmin: false,
      avatarUrl: null,
      timezone: null,
      confirmedAt: '2026-01-01T00:00:00Z',
      needsUsername: false,
    })
    renderForm()

    await fillCredentials(user)
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    await waitFor(() =>
      expect(login).toHaveBeenCalledWith({
        email: 'sosa@example.com',
        password: 'secret123',
      }),
    )
    expect(mockRefetch).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/app/home', { replace: true })
  })

  it('shows a generic alert on invalid credentials', async () => {
    const user = userEvent.setup()
    login.mockRejectedValueOnce(new Error('401'))
    getApiErrorMock.mockReturnValue({
      code: 'invalid_credentials',
      message: 'Email o contraseña inválidos.',
    })
    renderForm()

    await fillCredentials(user)
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(
      await screen.findByText('El email o la contraseña no coinciden.'),
    ).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('offers a resend button when the email is unconfirmed', async () => {
    const user = userEvent.setup()
    login.mockRejectedValueOnce(new Error('401'))
    getApiErrorMock.mockReturnValue({
      code: 'email_not_confirmed',
      message: 'Confirmá tu correo.',
    })
    resendConfirmation.mockResolvedValueOnce(undefined)
    renderForm()

    await fillCredentials(user)
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    const resendButton = await screen.findByRole('button', {
      name: 'Reenviar email de confirmación',
    })
    await user.click(resendButton)

    expect(resendConfirmation).toHaveBeenCalledWith({
      email: 'sosa@example.com',
    })
    expect(
      await screen.findByText('Listo, te reenviamos el email de confirmación.'),
    ).toBeInTheDocument()
  })
})
