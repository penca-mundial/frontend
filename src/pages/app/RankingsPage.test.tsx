import { render as rtlRender, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RankingsPage } from '@/pages/app/RankingsPage'
import type { Group, RankingEntry } from '@/types/domain'

/** Leaderboard rows link to user profiles, so a router context is required. */
function render(ui: ReactElement) {
  return rtlRender(<MemoryRouter>{ui}</MemoryRouter>)
}

vi.mock('@/features/groups/hooks/useGroups', () => ({ useGroups: vi.fn() }))
vi.mock('@/features/rankings/hooks/useRanking', () => ({ useRanking: vi.fn() }))
vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}))

import { useGroups } from '@/features/groups/hooks/useGroups'
import { useRanking } from '@/features/rankings/hooks/useRanking'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

const useGroupsMock = vi.mocked(useGroups)
const useRankingMock = vi.mocked(useRanking)
const useCurrentUserMock = vi.mocked(useCurrentUser)

function group(overrides: Partial<Group> & { id: string }): Group {
  return {
    name: `Penca ${overrides.id}`,
    description: null,
    isGeneralPool: false,
    code: 'ABCD1234',
    memberCount: 5,
    isOwner: false,
    createdAt: '2026-06-01T00:00:00Z',
    ownerUsername: null,
    ...overrides,
  }
}

function ent(overrides: Partial<RankingEntry> & { userId: string }): RankingEntry {
  return {
    username: `u${overrides.userId}`,
    points: 0,
    position: 1,
    exactCount: 0,
    avatarUrl: null,
    ...overrides,
  }
}

const GROUPS = [
  group({ id: '1', isGeneralPool: true, memberCount: 1247 }),
  group({ id: '7', name: 'Los Cracks', memberCount: 14 }),
]

beforeEach(() => {
  vi.clearAllMocks()
  useCurrentUserMock.mockReturnValue({
    currentUser: { id: '9' },
  } as unknown as ReturnType<typeof useCurrentUser>)
  useGroupsMock.mockReturnValue({
    data: GROUPS,
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useGroups>)
  useRankingMock.mockReturnValue({
    entries: [
      ent({ userId: '1', username: 'leo', position: 1, points: 134 }),
      ent({ userId: '9', username: 'santi', position: 2, points: 35 }),
    ],
    me: [ent({ userId: '9', username: 'santi', position: 2, points: 35 })],
    isLoading: false,
    isError: false,
    hasMore: false,
    loadMore: vi.fn(),
    isLoadingMore: false,
  } as unknown as ReturnType<typeof useRanking>)
})

describe('RankingsPage', () => {
  it('renders the heading, the pool pills, the window tabs and the leaderboard', () => {
    render(<RankingsPage />)

    expect(screen.getByRole('heading', { name: 'Ranking' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Pool general/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Los Cracks/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Hoy' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Semana' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Total' })).toBeInTheDocument()
    expect(screen.getByText('leo')).toBeInTheDocument()
  })

  it('defaults to the global scope and the total window', () => {
    render(<RankingsPage />)
    expect(useRankingMock).toHaveBeenLastCalledWith({
      scope: 'global',
      window: 'total',
    })
    expect(screen.getByRole('tab', { name: 'Total' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('shows the my-position card fed from the same slice', () => {
    render(<RankingsPage />)
    expect(screen.getByText('TU POSICIÓN')).toBeInTheDocument()
    expect(screen.getByText('2º')).toBeInTheDocument()
    expect(screen.getByText('A 99 pts del 1º')).toBeInTheDocument()
  })

  it('refetches the selected window when switching tabs', async () => {
    const user = userEvent.setup()
    render(<RankingsPage />)

    await user.click(screen.getByRole('tab', { name: 'Hoy' }))
    expect(useRankingMock).toHaveBeenLastCalledWith({
      scope: 'global',
      window: 'today',
    })
  })

  it('switches to a group scope when a private penca pill is selected', async () => {
    const user = userEvent.setup()
    render(<RankingsPage />)

    await user.click(screen.getByRole('button', { name: /Los Cracks/ }))
    expect(useRankingMock).toHaveBeenLastCalledWith({
      scope: { groupId: '7' },
      window: 'total',
    })
  })

  it('wires "Ver más jugadores" to the ranking loadMore (AC1/AC3)', async () => {
    const user = userEvent.setup()
    const loadMore = vi.fn()
    useRankingMock.mockReturnValue({
      entries: [ent({ userId: '1', username: 'leo', position: 1, points: 134 })],
      me: [],
      isLoading: false,
      isError: false,
      hasMore: true,
      loadMore,
      isLoadingMore: false,
    } as unknown as ReturnType<typeof useRanking>)
    render(<RankingsPage />)

    await user.click(screen.getByRole('button', { name: 'Ver más jugadores' }))
    expect(loadMore).toHaveBeenCalledTimes(1)
  })

  it('hides "Ver más jugadores" when there are no more pages (AC2)', () => {
    render(<RankingsPage />)
    expect(
      screen.queryByRole('button', { name: 'Ver más jugadores' }),
    ).not.toBeInTheDocument()
  })

  it('shows pill skeletons while the groups load', () => {
    useGroupsMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useGroups>)
    const { container } = render(<RankingsPage />)
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull()
  })
})
