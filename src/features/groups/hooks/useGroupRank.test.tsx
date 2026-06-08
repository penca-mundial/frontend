import { type ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}))
vi.mock('@/api/rankings.api', () => ({
  rankingsApi: { groupLeaderboard: vi.fn() },
}))

import { useGroupRank } from '@/features/groups/hooks/useGroupRank'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { rankingsApi } from '@/api/rankings.api'

const useCurrentUserMock = vi.mocked(useCurrentUser)
const groupLeaderboardMock = vi.mocked(rankingsApi.groupLeaderboard)

function Wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  // `currentUser.id` is a string (normalised at the auth boundary by mapUser),
  // matching the string `userId` from the rankings API.
  useCurrentUserMock.mockReturnValue({
    currentUser: { id: '9' },
  } as unknown as ReturnType<typeof useCurrentUser>)
})

describe('useGroupRank', () => {
  it("picks the current user's row from the me window, not me[0]", async () => {
    groupLeaderboardMock.mockResolvedValue({
      entries: [],
      me: [
        { userId: '5', username: 'u5', points: 0, position: 2, exactCount: 0, avatarUrl: null },
        { userId: '9', username: 'u9', points: 0, position: 3, exactCount: 0, avatarUrl: null },
      ],
      page: 1,
      hasMore: false,
    })

    const { result } = renderHook(() => useGroupRank('7'), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.rankPosition).toBe(3)
  })

  it('returns null when the user has no row in the window', async () => {
    groupLeaderboardMock.mockResolvedValue({ entries: [], me: [], page: 1, hasMore: false })

    const { result } = renderHook(() => useGroupRank('7'), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.rankPosition).toBeNull()
  })
})
