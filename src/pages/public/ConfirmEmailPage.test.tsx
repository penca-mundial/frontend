import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ConfirmEmailPage } from '@/pages/public/ConfirmEmailPage'

vi.mock('@/api/auth.api', () => ({
  authApi: { resendConfirmation: vi.fn() },
}))

import { authApi } from '@/api/auth.api'

const resendConfirmation = vi.mocked(authApi.resendConfirmation)

function renderAt(search: string) {
  return render(
    <MemoryRouter initialEntries={[`/confirm-email${search}`]}>
      <ConfirmEmailPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ConfirmEmailPage', () => {
  it('shows the success state with a link to login', () => {
    renderAt('?status=success')
    expect(screen.getByText('¡Email confirmado!')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Iniciar sesión' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', {
        name: 'Reenviar email de confirmación',
      }),
    ).not.toBeInTheDocument()
  })

  it('shows the invalid state with a resend form', () => {
    renderAt('?status=invalid')
    expect(screen.getByText('El enlace no es válido')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Reenviar email de confirmación' }),
    ).toBeInTheDocument()
  })

  it('resends the confirmation email and shows feedback', async () => {
    const user = userEvent.setup()
    resendConfirmation.mockResolvedValueOnce(undefined)
    renderAt('?status=invalid')

    await user.type(screen.getByLabelText('Email'), 'sosa@example.com')
    await user.click(
      screen.getByRole('button', { name: 'Reenviar email de confirmación' }),
    )

    expect(resendConfirmation).toHaveBeenCalledWith({
      email: 'sosa@example.com',
    })
    expect(
      await screen.findByText(/te enviamos un nuevo\s+enlace/i),
    ).toBeInTheDocument()
  })

  it('validates the email before resending', async () => {
    const user = userEvent.setup()
    renderAt('?status=expired')

    await user.click(
      screen.getByRole('button', { name: 'Reenviar email de confirmación' }),
    )

    expect(await screen.findByText('Ingresá tu email.')).toBeInTheDocument()
    expect(resendConfirmation).not.toHaveBeenCalled()
  })
})
