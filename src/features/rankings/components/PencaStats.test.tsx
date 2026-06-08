import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PencaStats } from '@/features/rankings/components/PencaStats'
import type { GroupEvolution } from '@/api/rankings.api'
import type { RankingEntry } from '@/types/domain'

vi.mock('@/features/rankings/hooks/useRanking', () => ({ useRanking: vi.fn() }))
vi.mock('@/features/rankings/hooks/useGroupEvolution', () => ({
  useGroupEvolution: vi.fn(),
}))
vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}))

import { useRanking } from '@/features/rankings/hooks/useRanking'
import { useGroupEvolution } from '@/features/rankings/hooks/useGroupEvolution'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

const useRankingMock = vi.mocked(useRanking)
const useGroupEvolutionMock = vi.mocked(useGroupEvolution)
const useCurrentUserMock = vi.mocked(useCurrentUser)

function ent(o: Partial<RankingEntry> & { userId: string }): RankingEntry {
  return {
    username: `u${o.userId}`,
    points: 0,
    position: 1,
    exactCount: 0,
    avatarUrl: null,
    ...o,
  }
}

const AVAILABLE: GroupEvolution = {
  available: true,
  lines: [
    {
      userId: '9',
      username: 'santi',
      avatarUrl: null,
      series: [
        { date: '2026-06-12', points: 4, rank: 2 },
        { date: '2026-06-13', points: 12, rank: 1 },
      ],
    },
    {
      userId: '1',
      username: 'leo',
      avatarUrl: null,
      series: [
        { date: '2026-06-12', points: 6, rank: 1 },
        { date: '2026-06-13', points: 9, rank: 2 },
      ],
    },
  ],
}

function mockSummary(me: RankingEntry | null) {
  useRankingMock.mockReturnValue({
    entries: me ? [me] : [],
    me: me ? [me] : [],
    isLoading: false,
    isError: false,
    hasMore: false,
    loadMore: vi.fn(),
    isLoadingMore: false,
  } as unknown as ReturnType<typeof useRanking>)
}

function mockEvolution(state: {
  data?: GroupEvolution
  isLoading?: boolean
  isError?: boolean
}) {
  useGroupEvolutionMock.mockReturnValue({
    data: state.data,
    isLoading: state.isLoading ?? false,
    isError: state.isError ?? false,
  } as unknown as ReturnType<typeof useGroupEvolution>)
}

beforeEach(() => {
  vi.clearAllMocks()
  useCurrentUserMock.mockReturnValue({
    currentUser: { id: '9' },
  } as unknown as ReturnType<typeof useCurrentUser>)
  mockSummary(ent({ userId: '9', username: 'santi', points: 12, position: 1, exactCount: 3 }))
})

describe('PencaStats', () => {
  it('shows the summary card with the user points, rank and exact count (AC2)', () => {
    mockEvolution({ data: AVAILABLE })
    render(<PencaStats groupId="7" />)

    // "Puntos" also labels the toggle button, and numbers also appear as chart
    // axis ticks — scope the summary assertions to the card's <span>s.
    expect(screen.getByText('Puntos', { selector: 'span' })).toBeInTheDocument()
    expect(screen.getByText('12', { selector: 'span' })).toBeInTheDocument()
    expect(screen.getByText('1º', { selector: 'span' })).toBeInTheDocument()
    expect(screen.getByText('Exactos')).toBeInTheDocument()
    expect(screen.getByText('3', { selector: 'span' })).toBeInTheDocument()
  })

  it('renders the chart with the points/position toggle when available (AC3)', () => {
    mockEvolution({ data: AVAILABLE })
    render(<PencaStats groupId="7" />)

    expect(screen.getByRole('img', { name: /Evoluci/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Puntos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Posición' })).toBeInTheDocument()
  })

  it('switches the chart metric when toggling to Posición (AC3)', async () => {
    const user = userEvent.setup()
    mockEvolution({ data: AVAILABLE })
    render(<PencaStats groupId="7" />)

    expect(screen.getByRole('img', { name: /Evolución de puntos/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Posición' }))
    expect(
      screen.getByRole('img', { name: /Evolución de posición/ }),
    ).toBeInTheDocument()
  })

  it('shows the gated empty-state when not yet available (AC4)', () => {
    mockEvolution({ data: { available: false, lines: [] } })
    render(<PencaStats groupId="7" />)

    expect(screen.getByText(/5º partido/i)).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /Evoluci/ })).not.toBeInTheDocument()
    // The summary card still shows even before the chart unlocks.
    expect(screen.getByText('Puntos')).toBeInTheDocument()
  })

  it('shows a skeleton while the evolution loads (AC4)', () => {
    mockEvolution({ isLoading: true })
    const { container } = render(<PencaStats groupId="7" />)
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull()
  })

  it('shows an error message when the evolution fails (AC4)', () => {
    mockEvolution({ isError: true })
    render(<PencaStats groupId="7" />)
    expect(
      screen.getByText(/No pudimos cargar las estadísticas/i),
    ).toBeInTheDocument()
  })
})
