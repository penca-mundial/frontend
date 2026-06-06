import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GroupManagementMenu } from '@/features/groups/components/GroupManagementMenu'
import type { Group } from '@/types/domain'

vi.mock('@/features/groups/hooks/useGroupMutations', () => ({
  useUpdateGroup: vi.fn(),
  useLeaveGroup: vi.fn(),
  useDeleteGroup: vi.fn(),
}))
vi.mock('@/hooks/useToast', () => ({ toast: vi.fn() }))

import {
  useDeleteGroup,
  useLeaveGroup,
  useUpdateGroup,
} from '@/features/groups/hooks/useGroupMutations'
import { toast } from '@/hooks/useToast'

const useUpdateMock = vi.mocked(useUpdateGroup)
const useLeaveMock = vi.mocked(useLeaveGroup)
const useDeleteMock = vi.mocked(useDeleteGroup)
const toastMock = vi.mocked(toast)

const updateAsync = vi.fn()
const leaveAsync = vi.fn()
const deleteAsync = vi.fn()

function makeGroup(overrides: Partial<Group> = {}): Group {
  return {
    id: '7',
    name: 'Los Cracks',
    description: 'Los pibes',
    isGeneralPool: false,
    code: 'PIZZA124',
    memberCount: 14,
    isOwner: false,
    createdAt: '2026-06-06T00:00:00Z',
    ownerUsername: null,
    ...overrides,
  }
}

function renderMenu(group: Group) {
  return render(
    <MemoryRouter initialEntries={['/app/groups/7']}>
      <Routes>
        <Route path="/app/groups/7" element={<GroupManagementMenu group={group} />} />
        <Route path="/app/groups" element={<div>LISTA DE PENCAS</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  updateAsync.mockResolvedValue(makeGroup())
  leaveAsync.mockResolvedValue(undefined)
  deleteAsync.mockResolvedValue(undefined)
  useUpdateMock.mockReturnValue({ mutateAsync: updateAsync, isPending: false } as unknown as ReturnType<typeof useUpdateGroup>)
  useLeaveMock.mockReturnValue({ mutateAsync: leaveAsync, isPending: false } as unknown as ReturnType<typeof useLeaveGroup>)
  useDeleteMock.mockReturnValue({ mutateAsync: deleteAsync, isPending: false } as unknown as ReturnType<typeof useDeleteGroup>)
})

describe('GroupManagementMenu', () => {
  it('shows Editar + Eliminar for the owner (no Salir)', async () => {
    const user = userEvent.setup()
    renderMenu(makeGroup({ isOwner: true }))

    await user.click(screen.getByRole('button', { name: 'Gestionar penca' }))
    expect(screen.getByText('Editar penca')).toBeInTheDocument()
    expect(screen.getByText('Eliminar penca')).toBeInTheDocument()
    expect(screen.queryByText('Salir de la penca')).not.toBeInTheDocument()
  })

  it('shows Salir for a non-owner member (no Editar/Eliminar)', async () => {
    const user = userEvent.setup()
    renderMenu(makeGroup({ isOwner: false }))

    await user.click(screen.getByRole('button', { name: 'Gestionar penca' }))
    expect(screen.getByText('Salir de la penca')).toBeInTheDocument()
    expect(screen.queryByText('Editar penca')).not.toBeInTheDocument()
    expect(screen.queryByText('Eliminar penca')).not.toBeInTheDocument()
  })

  it('leaves with confirmation, toasts and navigates', async () => {
    const user = userEvent.setup()
    renderMenu(makeGroup({ isOwner: false }))

    await user.click(screen.getByRole('button', { name: 'Gestionar penca' }))
    await user.click(screen.getByText('Salir de la penca'))
    // Confirm dialog.
    expect(await screen.findByText('¿Salir de Los Cracks?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Salir' }))

    await waitFor(() => expect(leaveAsync).toHaveBeenCalled())
    expect(toastMock).toHaveBeenCalledWith({ title: 'Saliste de Los Cracks' })
    expect(await screen.findByText('LISTA DE PENCAS')).toBeInTheDocument()
  })

  it('deletes with confirmation and navigates', async () => {
    const user = userEvent.setup()
    renderMenu(makeGroup({ isOwner: true }))

    await user.click(screen.getByRole('button', { name: 'Gestionar penca' }))
    await user.click(screen.getByText('Eliminar penca'))
    expect(await screen.findByText('¿Eliminar Los Cracks?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Eliminar' }))

    await waitFor(() => expect(deleteAsync).toHaveBeenCalled())
    expect(await screen.findByText('LISTA DE PENCAS')).toBeInTheDocument()
  })

  it('edits: prefilled form PATCHes name + description', async () => {
    const user = userEvent.setup()
    renderMenu(makeGroup({ isOwner: true }))

    await user.click(screen.getByRole('button', { name: 'Gestionar penca' }))
    await user.click(screen.getByText('Editar penca'))

    const nameInput = await screen.findByLabelText('Nombre')
    expect(nameInput).toHaveValue('Los Cracks')
    await user.clear(nameInput)
    await user.type(nameInput, 'Los Cracks FC')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() =>
      expect(updateAsync).toHaveBeenCalledWith({
        name: 'Los Cracks FC',
        description: 'Los pibes',
      }),
    )
    expect(toastMock).toHaveBeenCalledWith({ title: 'Penca actualizada' })
  })

  it('shows an error in the leave dialog without navigating', async () => {
    const user = userEvent.setup()
    leaveAsync.mockRejectedValue({
      isAxiosError: true,
      response: {
        data: { error: { code: 'validation_error', message: 'No pudimos sacarte.' } },
      },
    })
    renderMenu(makeGroup({ isOwner: false }))

    await user.click(screen.getByRole('button', { name: 'Gestionar penca' }))
    await user.click(screen.getByText('Salir de la penca'))
    await user.click(screen.getByRole('button', { name: 'Salir' }))

    expect(await screen.findByText('No pudimos sacarte.')).toBeInTheDocument()
    expect(screen.queryByText('LISTA DE PENCAS')).not.toBeInTheDocument()
  })
})
