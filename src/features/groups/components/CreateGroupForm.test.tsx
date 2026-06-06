import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { CreateGroupForm } from '@/features/groups/components/CreateGroupForm'
import type { Group } from '@/types/domain'

vi.mock('@/api/groups.api', () => ({ groupsApi: { create: vi.fn() } }))
vi.mock('@/hooks/useToast', () => ({ toast: vi.fn() }))

import { groupsApi } from '@/api/groups.api'
import { toast } from '@/hooks/useToast'

const createMock = vi.mocked(groupsApi.create)
const toastMock = vi.mocked(toast)

let invalidateSpy: MockInstance

function createdGroup(): Group {
  return {
    id: '5',
    name: 'Los Cracks',
    description: null,
    isGeneralPool: false,
    code: 'ABC12345',
    memberCount: 1,
    isOwner: true,
    createdAt: '2026-06-06T00:00:00Z',
  }
}

/** A 422 from the backend with already-translated full messages. */
function validationError(messages: string[]) {
  return {
    isAxiosError: true,
    response: {
      data: {
        error: {
          code: 'validation_error',
          message: messages.join(', '),
          details: { errors: messages },
        },
      },
    },
  }
}

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/app/groups/new']}>
        <Routes>
          <Route path="/app/groups/new" element={<CreateGroupForm />} />
          <Route path="/app/groups" element={<div>LISTA DE PENCAS</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => vi.clearAllMocks())

describe('CreateGroupForm', () => {
  it('requires a name and does not call the API when empty', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: 'Crear penca' }))

    expect(
      await screen.findByText(/al menos 3 caracteres/i),
    ).toBeInTheDocument()
    expect(createMock).not.toHaveBeenCalled()
  })

  it('submits the name and description to the API', async () => {
    const user = userEvent.setup()
    createMock.mockResolvedValue(createdGroup())
    renderForm()

    await user.type(screen.getByLabelText('Nombre'), 'Los Cracks')
    await user.type(
      screen.getByLabelText('Descripción (opcional)'),
      'Los pibes de siempre',
    )
    await user.click(screen.getByRole('button', { name: 'Crear penca' }))

    await waitFor(() =>
      expect(createMock).toHaveBeenCalledWith({
        name: 'Los Cracks',
        description: 'Los pibes de siempre',
      }),
    )
  })

  it('on success toasts, invalidates the list and navigates to /app/groups', async () => {
    const user = userEvent.setup()
    createMock.mockResolvedValue(createdGroup())
    renderForm()

    await user.type(screen.getByLabelText('Nombre'), 'Los Cracks')
    await user.click(screen.getByRole('button', { name: 'Crear penca' }))

    expect(await screen.findByText('LISTA DE PENCAS')).toBeInTheDocument()
    expect(toastMock).toHaveBeenCalledWith({ title: 'Penca creada' })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['groups', 'me'],
    })
  })

  it('shows the owner-limit error from the backend without navigating', async () => {
    const user = userEvent.setup()
    createMock.mockRejectedValue(
      validationError(['no podés tener más de 3 grupos activos']),
    )
    renderForm()

    await user.type(screen.getByLabelText('Nombre'), 'Cuarta penca')
    await user.click(screen.getByRole('button', { name: 'Crear penca' }))

    expect(
      await screen.findByText(/no podés tener más de 3 grupos activos/i),
    ).toBeInTheDocument()
    expect(createMock).toHaveBeenCalled()
    expect(screen.queryByText('LISTA DE PENCAS')).not.toBeInTheDocument()
  })
})
