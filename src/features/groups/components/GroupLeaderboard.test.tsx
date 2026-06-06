import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GroupLeaderboard } from '@/features/groups/components/GroupLeaderboard'
import type { RankingEntry } from '@/types/domain'

vi.mock('@/features/groups/hooks/useGroupLeaderboard', () => ({
  useGroupLeaderboard: vi.fn(),
}))
vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}))

import { useGroupLeaderboard } from '@/features/groups/hooks/useGroupLeaderboard'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

const useLeaderboardMock = vi.mocked(useGroupLeaderboard)
const useCurrentUserMock = vi.mocked(useCurrentUser)

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

function mockBoard(state: {
  entries?: RankingEntry[]
  me?: RankingEntry[]
  isLoading?: boolean
  isError?: boolean
}) {
  useLeaderboardMock.mockReturnValue({
    data:
      state.isLoading || state.isError
        ? undefined
        : { entries: state.entries ?? [], me: state.me ?? [] },
    isLoading: state.isLoading ?? false,
    isError: state.isError ?? false,
  } as unknown as ReturnType<typeof useGroupLeaderboard>)
}

beforeEach(() => {
  vi.clearAllMocks()
  useCurrentUserMock.mockReturnValue({
    currentUser: { id: '9' },
  } as unknown as ReturnType<typeof useCurrentUser>)
})

describe('GroupLeaderboard', () => {
  it('shows skeletons while loading', () => {
    mockBoard({ isLoading: true })
    const { container } = render(<GroupLeaderboard groupId="7" />)
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull()
  })

  it('shows an error message on failure', () => {
    mockBoard({ isError: true })
    render(<GroupLeaderboard groupId="7" />)
    expect(screen.getByText(/No pudimos cargar el ranking/i)).toBeInTheDocument()
  })

  it('shows a graceful empty state when there are no entries', () => {
    mockBoard({ entries: [] })
    render(<GroupLeaderboard groupId="7" />)
    expect(screen.getByText(/Todavía no hay posiciones/i)).toBeInTheDocument()
  })

  it('renders rows with username, exact count and points', () => {
    mockBoard({
      entries: [
        ent({ userId: '1', username: 'leo', position: 1, points: 30, exactCount: 4 }),
        ent({ userId: '2', username: 'fede', position: 2, points: 12, exactCount: 1 }),
      ],
    })
    render(<GroupLeaderboard groupId="7" />)

    expect(screen.getByText('leo')).toBeInTheDocument()
    expect(screen.getByText('4 exactos')).toBeInTheDocument()
    expect(screen.getByText('1 exacto')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
  })

  it('highlights the current user row in place with "· vos"', () => {
    mockBoard({
      entries: [
        ent({ userId: '1', username: 'leo', position: 1 }),
        ent({ userId: '9', username: 'santi', position: 2 }),
      ],
    })
    render(<GroupLeaderboard groupId="7" />)

    expect(screen.getByText(/· vos/)).toBeInTheDocument()
    expect(screen.getByText('santi')).toBeInTheDocument()
  })

  it('pins the user row from the me window when they are not in the top', () => {
    mockBoard({
      entries: [
        ent({ userId: '1', username: 'leo', position: 1 }),
        ent({ userId: '2', username: 'fede', position: 2 }),
      ],
      me: [ent({ userId: '9', username: 'santi', position: 142, points: 3 })],
    })
    render(<GroupLeaderboard groupId="7" />)

    // The user isn't in the top rows but their pinned row is shown.
    expect(screen.getByText('santi')).toBeInTheDocument()
    expect(screen.getByText(/· vos/)).toBeInTheDocument()
    expect(screen.getByText('142')).toBeInTheDocument()
  })
})
