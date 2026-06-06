import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { JoinGroupForm } from '@/features/groups/components/JoinGroupForm'
import type { Group } from '@/types/domain'

vi.mock('@/api/groups.api', () => ({ groupsApi: { join: vi.fn() } }))
vi.mock('@/hooks/useToast', () => ({ toast: vi.fn() }))

import { groupsApi } from '@/api/groups.api'
import { toast } from '@/hooks/useToast'

const joinMock = vi.mocked(groupsApi.join)
const toastMock = vi.mocked(toast)
let invalidateSpy: MockInstance

function joinedGroup(): Group {
  return {
    id: '9',
    name: 'Los Cracks',
    description: null,
    isGeneralPool: false,
    code: 'PIZZA124',
    memberCount: 13,
    isOwner: false,
    createdAt: '2026-06-06T00:00:00Z',
    ownerUsername: null,
  }
}

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

function renderForm(entry = '/app/groups/join') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route path="/app/groups/join" element={<JoinGroupForm />} />
          <Route path="/app/groups" element={<div>LISTA DE PENCAS</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => vi.clearAllMocks())

describe('JoinGroupForm', () => {
  it('requires a code and does not call the API when empty', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: 'Unirme' }))

    expect(await screen.findByText(/Ingresá el código/i)).toBeInTheDocument()
    expect(joinMock).not.toHaveBeenCalled()
  })

  it('autofills (uppercased) from the ?code= query param', () => {
    renderForm('/app/groups/join?code=pizza124')
    expect(screen.getByLabelText('Código de invitación')).toHaveValue('PIZZA124')
  })

  it('forces uppercase as the user types and submits the code', async () => {
    const user = userEvent.setup()
    joinMock.mockResolvedValue(joinedGroup())
    renderForm()

    const input = screen.getByLabelText('Código de invitación')
    await user.type(input, 'abc12345')
    expect(input).toHaveValue('ABC12345')

    await user.click(screen.getByRole('button', { name: 'Unirme' }))
    await waitFor(() => expect(joinMock).toHaveBeenCalledWith('ABC12345'))
  })

  it('on success toasts, invalidates the list and navigates', async () => {
    const user = userEvent.setup()
    joinMock.mockResolvedValue(joinedGroup())
    renderForm('/app/groups/join?code=PIZZA124')

    await user.click(screen.getByRole('button', { name: 'Unirme' }))

    expect(await screen.findByText('LISTA DE PENCAS')).toBeInTheDocument()
    expect(toastMock).toHaveBeenCalledWith({ title: 'Te uniste a Los Cracks' })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['groups', 'me'] })
  })

  it('shows an invalid-code error without navigating', async () => {
    const user = userEvent.setup()
    joinMock.mockRejectedValue(
      validationError(['El grupo no existe o el código es inválido.']),
    )
    renderForm('/app/groups/join?code=BADCODE1')

    await user.click(screen.getByRole('button', { name: 'Unirme' }))

    expect(
      await screen.findByText(/no existe o el código es inválido/i),
    ).toBeInTheDocument()
    expect(screen.queryByText('LISTA DE PENCAS')).not.toBeInTheDocument()
  })

  it('shows a full-penca error form-level', async () => {
    const user = userEvent.setup()
    joinMock.mockRejectedValue(
      validationError(['El grupo alcanzó el máximo de integrantes']),
    )
    renderForm('/app/groups/join?code=FULLGRP1')

    await user.click(screen.getByRole('button', { name: 'Unirme' }))

    expect(
      await screen.findByText(/alcanzó el máximo de integrantes/i),
    ).toBeInTheDocument()
    expect(screen.queryByText('LISTA DE PENCAS')).not.toBeInTheDocument()
  })
})
