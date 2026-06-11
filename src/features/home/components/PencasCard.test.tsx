import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PencasCard } from '@/features/home/components/PencasCard'
import type { Group } from '@/types/domain'

vi.mock('@/features/groups/hooks/useGroups', () => ({ useGroups: vi.fn() }))
vi.mock('@/features/groups/hooks/useGroupRank', () => ({ useGroupRank: vi.fn() }))

import { useGroups } from '@/features/groups/hooks/useGroups'
import { useGroupRank } from '@/features/groups/hooks/useGroupRank'

const useGroupsMock = vi.mocked(useGroups)
const useGroupRankMock = vi.mocked(useGroupRank)

const general: Group = {
  id: '1',
  name: 'Penca general',
  description: null,
  isGeneralPool: true,
  code: 'GEN',
  memberCount: 1247,
  isOwner: false,
  createdAt: '2026-01-01T00:00:00Z',
  ownerUsername: null,
}
const mine: Group = {
  id: '2',
  name: 'Los del fondo',
  description: null,
  isGeneralPool: false,
  code: 'ABC123',
  memberCount: 14,
  isOwner: true,
  createdAt: '2026-01-01T00:00:00Z',
  ownerUsername: 'santi',
}

function renderCard() {
  return render(
    <MemoryRouter>
      <PencasCard />
    </MemoryRouter>,
  )
}

beforeEach(() => vi.clearAllMocks())

describe('PencasCard', () => {
  it('lists pencas with the user rank ("Nº de M"), owner badge and a Nueva action', () => {
    useGroupsMock.mockReturnValue({
      data: [general, mine],
      isLoading: false,
    } as unknown as ReturnType<typeof useGroups>)
    // Rank by group id so each row shows a distinct standing.
    useGroupRankMock.mockImplementation((groupId: string) => ({
      rankPosition: groupId === '2' ? 3 : 87,
      isLoading: false,
      isError: false,
    }))

    renderCard()

    expect(screen.getByText('Penca general')).toBeInTheDocument()
    expect(screen.getByText('Los del fondo')).toBeInTheDocument()
    // "3º de 14" splits across spans; assert the pieces.
    expect(screen.getByText('3º')).toBeInTheDocument()
    expect(screen.getByText(/de 14/)).toBeInTheDocument()
    expect(screen.getByText('Creador')).toBeInTheDocument()

    const detail = screen.getByRole('link', { name: /Los del fondo/ })
    expect(detail).toHaveAttribute('href', '/app/groups/2')
    expect(screen.getByRole('link', { name: /Nueva/ })).toHaveAttribute(
      'href',
      '/app/groups/new',
    )
  })

  it('falls back to member count when a rank is unavailable', () => {
    useGroupsMock.mockReturnValue({
      data: [mine],
      isLoading: false,
    } as unknown as ReturnType<typeof useGroups>)
    useGroupRankMock.mockReturnValue({
      rankPosition: null,
      isLoading: false,
      isError: false,
    })

    renderCard()

    expect(screen.getByText(/14 jugadores/)).toBeInTheDocument()
  })
})
