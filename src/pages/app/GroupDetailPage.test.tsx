import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GroupDetailPage } from '@/pages/app/GroupDetailPage'
import type { Group, RankingEntry } from '@/types/domain'

vi.mock('@/features/groups/hooks/useGroup', () => ({ useGroup: vi.fn() }))
vi.mock('@/features/rankings/hooks/useRanking', () => ({
  useRanking: vi.fn(),
}))
vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}))
// Management menu is tested separately; stub it (it needs a QueryClient).
vi.mock('@/features/groups/components/GroupManagementMenu', () => ({
  GroupManagementMenu: () => null,
}))

import { useGroup } from '@/features/groups/hooks/useGroup'
import { useRanking } from '@/features/rankings/hooks/useRanking'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

const useGroupMock = vi.mocked(useGroup)
const useRankingMock = vi.mocked(useRanking)
const useCurrentUserMock = vi.mocked(useCurrentUser)

const GROUP: Group = {
  id: '7',
  name: 'Los Cracks',
  description: 'Los pibes',
  isGeneralPool: false,
  code: 'PIZZA124',
  memberCount: 14,
  isOwner: true,
  createdAt: '2026-06-06T00:00:00Z',
  ownerUsername: null,
}

const ENTRY: RankingEntry = {
  userId: '9',
  username: 'santi',
  points: 12,
  position: 1,
  exactCount: 2,
  avatarUrl: null,
}

function mockGroup(state: { isLoading?: boolean; isError?: boolean; data?: Group }) {
  useGroupMock.mockReturnValue({
    data: state.data,
    isLoading: state.isLoading ?? false,
    isError: state.isError ?? false,
  } as unknown as ReturnType<typeof useGroup>)
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/app/groups/7']}>
      <Routes>
        <Route path="/app/groups/:id" element={<GroupDetailPage />} />
        <Route path="/app/groups" element={<div>LISTA</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  useCurrentUserMock.mockReturnValue({
    currentUser: { id: '9' },
  } as unknown as ReturnType<typeof useCurrentUser>)
  useRankingMock.mockReturnValue({
    data: { entries: [ENTRY], me: [] },
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useRanking>)
})

describe('GroupDetailPage', () => {
  it('renders the header and the three tabs, Ranking active by default', () => {
    mockGroup({ data: GROUP })
    renderPage()

    expect(screen.getByRole('heading', { name: 'Los Cracks' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Ranking' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Miembros' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Estadísticas' })).toBeInTheDocument()
    // Ranking content (the leaderboard) is shown by default.
    expect(screen.getByText('santi')).toBeInTheDocument()
  })

  it('shows a "Próximamente" placeholder on the Estadísticas tab', async () => {
    const user = userEvent.setup()
    mockGroup({ data: GROUP })
    renderPage()

    await user.click(screen.getByRole('tab', { name: 'Estadísticas' }))
    expect(screen.getByText('Próximamente')).toBeInTheDocument()
  })

  it('hides the Miembros tab on the general pool', () => {
    mockGroup({ data: { ...GROUP, isGeneralPool: true } })
    renderPage()
    expect(screen.getByRole('tab', { name: 'Ranking' })).toBeInTheDocument()
    expect(
      screen.queryByRole('tab', { name: 'Miembros' }),
    ).not.toBeInTheDocument()
  })

  it('shows an error state when the group fails to load', () => {
    mockGroup({ isError: true })
    renderPage()
    expect(screen.getByText(/No pudimos cargar la penca/i)).toBeInTheDocument()
  })
})
