import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GroupMembersList } from '@/features/groups/components/GroupMembersList'
import type { GroupMember } from '@/types/domain'

vi.mock('@/features/groups/hooks/useGroupMembers', () => ({
  useGroupMembers: vi.fn(),
}))
vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}))

import { useGroupMembers } from '@/features/groups/hooks/useGroupMembers'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

const useMembersMock = vi.mocked(useGroupMembers)
const useCurrentUserMock = vi.mocked(useCurrentUser)
const fetchNextPage = vi.fn()

function mem(overrides: Partial<GroupMember> & { userId: string }): GroupMember {
  return {
    username: `u${overrides.userId}`,
    avatarUrl: null,
    isOwner: false,
    joinedAt: '2026-06-06T00:00:00Z',
    ...overrides,
  }
}

function mockMembers(state: {
  members?: GroupMember[]
  isLoading?: boolean
  isError?: boolean
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
}) {
  useMembersMock.mockReturnValue({
    data:
      state.isLoading || state.isError
        ? undefined
        : { pages: [{ members: state.members ?? [], totalCount: 0, page: 1, perPage: 25 }] },
    isLoading: state.isLoading ?? false,
    isError: state.isError ?? false,
    hasNextPage: state.hasNextPage ?? false,
    isFetchingNextPage: state.isFetchingNextPage ?? false,
    fetchNextPage,
  } as unknown as ReturnType<typeof useGroupMembers>)
}

beforeEach(() => {
  vi.clearAllMocks()
  useCurrentUserMock.mockReturnValue({
    currentUser: { id: '9' },
  } as unknown as ReturnType<typeof useCurrentUser>)
})

describe('GroupMembersList', () => {
  it('shows skeletons while loading', () => {
    mockMembers({ isLoading: true })
    const { container } = render(<GroupMembersList groupId="7" />)
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull()
  })

  it('shows an error message on failure', () => {
    mockMembers({ isError: true })
    render(<GroupMembersList groupId="7" />)
    expect(screen.getByText(/No pudimos cargar los miembros/i)).toBeInTheDocument()
  })

  it('shows a graceful empty state', () => {
    mockMembers({ members: [] })
    render(<GroupMembersList groupId="7" />)
    expect(screen.getByText(/Todavía no hay miembros/i)).toBeInTheDocument()
  })

  it('renders members with bare username, join date and an owner badge', () => {
    mockMembers({
      members: [
        mem({ userId: '1', username: 'leo', isOwner: true }),
        mem({ userId: '2', username: 'fede' }),
      ],
    })
    render(<GroupMembersList groupId="7" />)

    expect(screen.getByText('leo')).toBeInTheDocument()
    expect(screen.getByText('fede')).toBeInTheDocument()
    expect(screen.getByText('owner')).toBeInTheDocument() // creator only
    expect(screen.getAllByText(/Se unió el/).length).toBeGreaterThan(0)
  })

  it('highlights the current user row with "· vos"', () => {
    mockMembers({
      members: [
        mem({ userId: '1', username: 'leo' }),
        mem({ userId: '9', username: 'santi' }),
      ],
    })
    render(<GroupMembersList groupId="7" />)
    expect(screen.getByText('santi')).toBeInTheDocument()
    expect(screen.getByText(/· vos/)).toBeInTheDocument()
  })

  it('loads the next page when "Ver más miembros" is clicked', async () => {
    const user = userEvent.setup()
    mockMembers({
      members: [mem({ userId: '1', username: 'leo' })],
      hasNextPage: true,
    })
    render(<GroupMembersList groupId="7" />)

    await user.click(screen.getByRole('button', { name: /Ver más miembros/ }))
    expect(fetchNextPage).toHaveBeenCalled()
  })
})
