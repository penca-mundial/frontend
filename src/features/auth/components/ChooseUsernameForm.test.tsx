import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ChooseUsernameForm } from '@/features/auth/components/ChooseUsernameForm'

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

vi.mock('@/api/users.api', () => ({
  usersApi: { setUsername: vi.fn() },
}))
vi.mock('@/api/auth.api', () => ({ getApiError: vi.fn() }))

import { usersApi } from '@/api/users.api'
import { getApiError } from '@/api/auth.api'

const setUsername = vi.mocked(usersApi.setUsername)
const getApiErrorMock = vi.mocked(getApiError)

function renderForm() {
  return render(
    <MemoryRouter>
      <ChooseUsernameForm />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ChooseUsernameForm', () => {
  it('validates the username before submitting', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByLabelText('Nombre de usuario'), 'AB')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(
      await screen.findByText(
        'Entre 3 y 20 caracteres: minúsculas, números o guion bajo.',
      ),
    ).toBeInTheDocument()
    expect(setUsername).not.toHaveBeenCalled()
  })

  it('claims the username, refetches and navigates home', async () => {
    const user = userEvent.setup()
    setUsername.mockResolvedValueOnce(undefined)
    renderForm()

    await user.type(screen.getByLabelText('Nombre de usuario'), 'sosa_10')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    await waitFor(() => expect(setUsername).toHaveBeenCalledWith('sosa_10'))
    expect(mockRefetch).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/app/home', { replace: true })
  })

  it('shows a duplicate-username error from the backend', async () => {
    const user = userEvent.setup()
    setUsername.mockRejectedValueOnce(new Error('422'))
    getApiErrorMock.mockReturnValue({
      code: 'validation_error',
      message: 'Datos inválidos.',
      details: { errors: ['Username ya está en uso'] },
    })
    renderForm()

    await user.type(screen.getByLabelText('Nombre de usuario'), 'taken_one')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(
      await screen.findByText('Username ya está en uso'),
    ).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
