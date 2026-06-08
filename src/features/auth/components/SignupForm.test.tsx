import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SignupForm } from '@/features/auth/components/SignupForm'

vi.mock('@/api/auth.api', () => ({
  authApi: { signup: vi.fn() },
  getApiError: vi.fn(),
}))

import { authApi, getApiError } from '@/api/auth.api'

const signup = vi.mocked(authApi.signup)
const getApiErrorMock = vi.mocked(getApiError)

function renderForm() {
  return render(
    <MemoryRouter>
      <SignupForm />
    </MemoryRouter>,
  )
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Email'), 'new@example.com')
  await user.type(screen.getByLabelText('Nombre de usuario'), 'sosa_10')
  await user.type(screen.getByLabelText('Contraseña'), 'secret123')
  await user.type(screen.getByLabelText('Repetí la contraseña'), 'secret123')
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('SignupForm', () => {
  it('shows the password requirements as discreet help text from the start', () => {
    renderForm()

    // Requirements visible before any interaction (AC1), wording exact.
    const hint = screen.getByText(
      'Mínimo 8 caracteres, con al menos un número.',
    )
    expect(hint).toBeInTheDocument()
    // It must be help text, not an error: the password input is described by it.
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining(hint.id),
    )
    // AC3: no mention of uppercase, symbols or breach/pwned checks.
    expect(hint.textContent).not.toMatch(/may[úu]scula|s[íi]mbolo|filtrad/i)
  })

  it('keeps the requirements help text visible alongside a password error', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByLabelText('Contraseña'), 'short')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(screen.getByText('Mínimo 8 caracteres.')).toBeInTheDocument()
    // The proactive requirements stay put even while the error shows.
    expect(
      screen.getByText('Mínimo 8 caracteres, con al menos un número.'),
    ).toBeInTheDocument()
  })

  it('gives live feedback on the username field as the user types', async () => {
    const user = userEvent.setup()
    renderForm()

    const username = screen.getByLabelText('Nombre de usuario')
    await user.type(username, 'ab')
    expect(
      screen.getByText('Usá solo minúsculas, números o guion bajo (3 a 20).'),
    ).toBeInTheDocument()

    await user.type(username, 'c_1')
    expect(screen.getByText('Se ve bien.')).toBeInTheDocument()
  })

  it('blocks invalid submissions with field validation', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Ingresá tu email.')).toBeInTheDocument()
    expect(signup).not.toHaveBeenCalled()
  })

  it('flags mismatched passwords', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByLabelText('Email'), 'new@example.com')
    await user.type(screen.getByLabelText('Nombre de usuario'), 'sosa_10')
    await user.type(screen.getByLabelText('Contraseña'), 'secret123')
    await user.type(screen.getByLabelText('Repetí la contraseña'), 'secret999')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(
      await screen.findByText('Las contraseñas no coinciden.'),
    ).toBeInTheDocument()
    expect(signup).not.toHaveBeenCalled()
  })

  it('shows the confirmation-pending screen on success', async () => {
    const user = userEvent.setup()
    signup.mockResolvedValueOnce({
      id: 'u1',
      email: 'new@example.com',
      username: 'sosa_10',
      isAdmin: false,
      avatarUrl: null,
      timezone: null,
      confirmedAt: null,
      needsUsername: false,
    })
    renderForm()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Revisá tu correo')).toBeInTheDocument()
    expect(screen.getByText('new@example.com')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Ir a iniciar sesión' }),
    ).toBeInTheDocument()
    expect(signup).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'secret123',
      username: 'sosa_10',
    })
  })

  it('maps duplicate email/username backend errors onto their fields', async () => {
    const user = userEvent.setup()
    signup.mockRejectedValueOnce(new Error('422'))
    getApiErrorMock.mockReturnValue({
      code: 'validation_error',
      message: 'Datos inválidos.',
      details: {
        errors: ['Email ya está en uso', 'Username ya está en uso'],
      },
    })
    renderForm()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Email ya está en uso')).toBeInTheDocument()
    expect(screen.getByText('Username ya está en uso')).toBeInTheDocument()
    expect(screen.queryByText('Revisá tu correo')).not.toBeInTheDocument()
  })
})
