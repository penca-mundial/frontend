import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GroupsPage } from '@/pages/app/GroupsPage'
import type { Group } from '@/types/domain'

vi.mock('@/features/groups/hooks/useGroups', () => ({ useGroups: vi.fn() }))

import { useGroups } from '@/features/groups/hooks/useGroups'

const useGroupsMock = vi.mocked(useGroups)

function makeGroup(overrides: Partial<Group> = {}): Group {
  return {
    id: '2',
    name: 'Los Cracks',
    description: null,
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
  memberCount: 1240,
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

beforeEach(() => vi.clearAllMocks())

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

  it('shows skeletons while loading', () => {
    mock({ isLoading: true })
    const { container } = renderPage()
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull()
  })

  it('renders the general pool first, then private groups, with no empty state', () => {
    mock({ data: [GENERAL, makeGroup({ id: '2', name: 'Los Cracks' })] })
    renderPage()

    expect(screen.getByText('Mundial 2026')).toBeInTheDocument()
    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Los Cracks')).toBeInTheDocument()
    expect(
      screen.queryByText(/Todavía no estás en ninguna penca privada/i),
    ).not.toBeInTheDocument()
  })

  it('shows the empty state (with CTAs) when only the general pool exists', () => {
    mock({ data: [GENERAL] })
    renderPage()

    expect(screen.getByText('Mundial 2026')).toBeInTheDocument()
    expect(
      screen.getByText(/Todavía no estás en ninguna penca privada/i),
    ).toBeInTheDocument()
    // CTAs appear at the top and again in the empty state.
    expect(screen.getAllByRole('link', { name: /Crear penca/ })).toHaveLength(2)
  })

  it('shows an error message when the request fails', () => {
    mock({ isError: true })
    renderPage()
    expect(
      screen.getByText(/No pudimos cargar tus pencas/i),
    ).toBeInTheDocument()
  })
})
