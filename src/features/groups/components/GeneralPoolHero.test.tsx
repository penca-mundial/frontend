import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GeneralPoolHero } from '@/features/groups/components/GeneralPoolHero'
import type { Group } from '@/types/domain'

vi.mock('@/features/groups/hooks/useGroupRank', () => ({
  useGroupRank: vi.fn(),
}))

import { useGroupRank } from '@/features/groups/hooks/useGroupRank'

const useGroupRankMock = vi.mocked(useGroupRank)

function makeGeneral(overrides: Partial<Group> = {}): Group {
  return {
    id: '1',
    name: 'Mundial 2026', // stored name — should NOT be shown
    description: null,
    isGeneralPool: true,
    code: 'GENERAL',
    memberCount: 1247,
    isOwner: false,
    createdAt: '2026-01-01T00:00:00Z',
    ownerUsername: null,
    ...overrides,
  }
}

function mockRank(rank: number | null, isLoading = false) {
  useGroupRankMock.mockReturnValue({
    rankPosition: rank,
    isLoading,
    isError: false,
  } as unknown as ReturnType<typeof useGroupRank>)
}

function renderHero(group: Group) {
  return render(
    <MemoryRouter>
      <GeneralPoolHero group={group} />
    </MemoryRouter>,
  )
}

beforeEach(() => vi.clearAllMocks())

describe('GeneralPoolHero', () => {
  it('renders the badge, fixed copy, rank and formatted total, and links to the detail', () => {
    mockRank(12)
    renderHero(makeGeneral())

    expect(screen.getByText('POOL GENERAL')).toBeInTheDocument()
    expect(screen.getByText('Penca general')).toBeInTheDocument()
    expect(
      screen.getByText('Estás compitiendo con todos los usuarios.'),
    ).toBeInTheDocument()
    expect(screen.getByText('12º')).toBeInTheDocument()
    expect(screen.getByText('de 1.247 jugadores')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Penca general/ }),
    ).toHaveAttribute('href', '/app/groups/1')
  })

  it('uses the fixed copy, not the stored group name', () => {
    mockRank(1)
    renderHero(makeGeneral())
    expect(screen.queryByText('Mundial 2026')).not.toBeInTheDocument()
  })

  it('keeps the total while the rank loads', () => {
    mockRank(null, true)
    renderHero(makeGeneral())
    expect(screen.queryByText('12º')).not.toBeInTheDocument()
    expect(screen.getByText('de 1.247 jugadores')).toBeInTheDocument()
  })
})
