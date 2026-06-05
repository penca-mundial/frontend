import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GroupsPage } from '@/pages/app/GroupsPage'
import type { Group } from '@/types/domain'

vi.mock('@/features/groups/hooks/useGroups', () => ({ useGroups: vi.fn() }))
vi.mock('@/features/groups/hooks/useGroupRank', () => ({
  useGroupRank: vi.fn(),
}))

import { useGroups } from '@/features/groups/hooks/useGroups'
import { useGroupRank } from '@/features/groups/hooks/useGroupRank'

const useGroupsMock = vi.mocked(useGroups)
const useGroupRankMock = vi.mocked(useGroupRank)

function makeGroup(overrides: Partial<Group> = {}): Group {
  return {
    id: '2',
    name: 'Los Cracks',
    description: 'Los pibes',
    isGeneralPool: false,
    code: 'ABC123',
    memberCount: 12,
    isOwner: false,
    createdAt: '2026-06-01T00:00:00Z',
    ...overrides,
  }
}

const GENERAL = makeGroup({
  id: '1',
  name: 'Mundial 2026',
  isGeneralPool: true,
  memberCount: 1247,
})

function mock(state: {
  data?: Group[]
  isLoading?: boolean
  isError?: boolean
}) {
  useGroupsMock.mockReturnValue({
    data: state.data,
    isLoading: state.isLoading ?? false,
    isError: state.isError ?? false,
  } as unknown as ReturnType<typeof useGroups>)
}

function renderPage() {
  return render(
    <MemoryRouter>
      <GroupsPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  // Every card/hero asks for its rank; a fixed value keeps them rendering.
  useGroupRankMock.mockReturnValue({
    rankPosition: 1,
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useGroupRank>)
})

describe('GroupsPage', () => {
  it('renders the title and both CTAs linking to create / join', () => {
    mock({ data: [GENERAL] })
    renderPage()

    expect(
      screen.getByRole('heading', { name: 'Pencas', level: 1 }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: /Crear penca/ })[0],
    ).toHaveAttribute('href', '/app/groups/new')
    expect(
      screen.getAllByRole('link', { name: /Unirme con código/ })[0],
    ).toHaveAttribute('href', '/app/groups/join')
  })

  it('renders both labelled sections, the general hero and private cards', () => {
    mock({ data: [GENERAL, makeGroup({ id: '2', name: 'Los Cracks' })] })
    renderPage()

    expect(
      screen.getByRole('heading', { name: 'POOL GENERAL' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'TUS PENCAS PRIVADAS' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Penca general')).toBeInTheDocument() // hero copy
    expect(screen.getByText('Los Cracks')).toBeInTheDocument() // private card
    expect(
      screen.queryByText(/Todavía no estás en ninguna penca privada/i),
    ).not.toBeInTheDocument()
  })

  it('shows the empty state (with CTAs) when only the general pool exists', () => {
    mock({ data: [GENERAL] })
    renderPage()

    expect(screen.getByText('Penca general')).toBeInTheDocument()
    expect(
      screen.getByText(/Todavía no estás en ninguna penca privada/i),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Crear penca/ })).toHaveLength(2)
  })

  it('shows a dynamic subtitle pluralised by the private count', () => {
    mock({
      data: [GENERAL, makeGroup({ id: '2' }), makeGroup({ id: '3' })],
    })
    renderPage()
    expect(
      screen.getByText('2 privadas · 1 pool general'),
    ).toBeInTheDocument()
  })

  it('singularises the subtitle with a single private penca', () => {
    mock({ data: [GENERAL, makeGroup({ id: '2' })] })
    renderPage()
    expect(screen.getByText('1 privada · 1 pool general')).toBeInTheDocument()
  })

  it('hides the subtitle when the user is only in the general pool', () => {
    mock({ data: [GENERAL] })
    renderPage()
    expect(screen.queryByText(/· 1 pool general/)).not.toBeInTheDocument()
  })

  it('shows skeletons while loading', () => {
    mock({ isLoading: true })
    const { container } = renderPage()
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull()
  })

  it('shows an error message when the request fails', () => {
    mock({ isError: true })
    renderPage()
    expect(
      screen.getByText(/No pudimos cargar tus pencas/i),
    ).toBeInTheDocument()
  })
})
