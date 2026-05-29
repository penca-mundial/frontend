import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'

vi.mock('@/api/auth.api', () => ({
  authApi: { requestPasswordReset: vi.fn() },
}))

import { authApi } from '@/api/auth.api'

const requestPasswordReset = vi.mocked(authApi.requestPasswordReset)

function renderForm() {
  return render(
    <MemoryRouter>
      <ForgotPasswordForm />
    </MemoryRouter>,
  )
}

const FRIENDLY_MESSAGE = /Si el email está registrado, vas a recibir un enlace/

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ForgotPasswordForm', () => {
  it('validates the email before submitting', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(
      screen.getByRole('button', { name: 'Enviar enlace de recuperación' }),
    )

    expect(await screen.findByText('Ingresá tu email.')).toBeInTheDocument()
    expect(requestPasswordReset).not.toHaveBeenCalled()
  })

  it('shows the neutral confirmation after a successful request', async () => {
    const user = userEvent.setup()
    requestPasswordReset.mockResolvedValueOnce(undefined)
    renderForm()

    await user.type(screen.getByLabelText('Email'), 'sosa@example.com')
    await user.click(
      screen.getByRole('button', { name: 'Enviar enlace de recuperación' }),
    )

    expect(await screen.findByText(FRIENDLY_MESSAGE)).toBeInTheDocument()
    expect(requestPasswordReset).toHaveBeenCalledWith({
      email: 'sosa@example.com',
    })
  })

  it('shows the same neutral confirmation even if the request fails', async () => {
    const user = userEvent.setup()
    requestPasswordReset.mockRejectedValueOnce(new Error('network'))
    renderForm()

    await user.type(screen.getByLabelText('Email'), 'sosa@example.com')
    await user.click(
      screen.getByRole('button', { name: 'Enviar enlace de recuperación' }),
    )

    expect(await screen.findByText(FRIENDLY_MESSAGE)).toBeInTheDocument()
  })
})
