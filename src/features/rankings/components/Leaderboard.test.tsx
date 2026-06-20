import { render as rtlRender, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Leaderboard } from '@/features/rankings/components/Leaderboard'
import type { RankingEntry } from '@/types/domain'

/** Rows link to user profiles, so every render needs a router context. */
function render(ui: ReactElement) {
  return rtlRender(<MemoryRouter>{ui}</MemoryRouter>)
}

vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}))

import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

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

beforeEach(() => {
  vi.clearAllMocks()
  useCurrentUserMock.mockReturnValue({
    currentUser: { id: '9' },
  } as unknown as ReturnType<typeof useCurrentUser>)
})

describe('Leaderboard', () => {
  it('shows skeletons while loading', () => {
    const { container } = render(<Leaderboard entries={[]} me={[]} isLoading />)
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull()
  })

  it('shows an error message on failure', () => {
    render(<Leaderboard entries={[]} me={[]} isError />)
    expect(screen.getByText(/No pudimos cargar el ranking/i)).toBeInTheDocument()
  })

  it('shows a graceful empty state when there are no entries', () => {
    render(<Leaderboard entries={[]} me={[]} />)
    expect(screen.getByText(/Todavía no hay posiciones/i)).toBeInTheDocument()
  })

  it('renders rows with username, exact count and points', () => {
    render(
      <Leaderboard
        entries={[
          ent({ userId: '1', username: 'leo', position: 1, points: 30, exactCount: 4 }),
          ent({ userId: '2', username: 'fede', position: 2, points: 12, exactCount: 1 }),
        ]}
        me={[]}
      />,
    )

    expect(screen.getByText('leo')).toBeInTheDocument()
    expect(screen.getByText('4 exactos')).toBeInTheDocument()
    expect(screen.getByText('1 exacto')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
  })

  it('links each row to the player public profile', () => {
    render(
      <Leaderboard
        entries={[ent({ userId: '42', username: 'leo', position: 1 })]}
        me={[]}
      />,
    )

    expect(screen.getByRole('link', { name: /leo/ })).toHaveAttribute(
      'href',
      '/app/users/42',
    )
  })

  it('renders shared positions for ties as given (1, 1, 3)', () => {
    render(
      <Leaderboard
        entries={[
          ent({ userId: '1', username: 'leo', position: 1, points: 30 }),
          ent({ userId: '2', username: 'fede', position: 1, points: 30 }),
          ent({ userId: '3', username: 'caro', position: 3, points: 12 }),
        ]}
        me={[]}
      />,
    )

    // Two shared gold medals plus a bronze — RANK() semantics straight from
    // the backend, no re-numbering on the client.
    expect(screen.getAllByText('1')).toHaveLength(2)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('highlights the current user row in place with "· vos"', () => {
    render(
      <Leaderboard
        entries={[
          ent({ userId: '1', username: 'leo', position: 1 }),
          ent({ userId: '9', username: 'santi', position: 2 }),
        ]}
        me={[]}
      />,
    )

    expect(screen.getByText(/· vos/)).toBeInTheDocument()
    expect(screen.getByText('santi')).toBeInTheDocument()
  })

  it('pins the user row from the me window when they are not in the top', () => {
    render(
      <Leaderboard
        entries={[
          ent({ userId: '1', username: 'leo', position: 1 }),
          ent({ userId: '2', username: 'fede', position: 2 }),
        ]}
        me={[ent({ userId: '9', username: 'santi', position: 142, points: 3 })]}
      />,
    )

    // The user isn't in the top rows but their pinned row is shown.
    expect(screen.getByText('santi')).toBeInTheDocument()
    expect(screen.getByText(/· vos/)).toBeInTheDocument()
    expect(screen.getByText('142')).toBeInTheDocument()
  })

  it('shows "Ver más jugadores" when hasMore and forwards the click (AC1)', async () => {
    const user = userEvent.setup()
    const onLoadMore = vi.fn()
    render(
      <Leaderboard
        entries={[ent({ userId: '1', username: 'leo', position: 1 })]}
        me={[]}
        hasMore
        onLoadMore={onLoadMore}
      />,
    )

    const button = screen.getByRole('button', { name: 'Ver más jugadores' })
    await user.click(button)
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it('hides the button when there are no more pages (AC2)', () => {
    render(
      <Leaderboard
        entries={[ent({ userId: '1', username: 'leo', position: 1 })]}
        me={[]}
        hasMore={false}
        onLoadMore={vi.fn()}
      />,
    )
    expect(
      screen.queryByRole('button', { name: 'Ver más jugadores' }),
    ).not.toBeInTheDocument()
  })

  it('disables the button while the next page loads', () => {
    render(
      <Leaderboard
        entries={[ent({ userId: '1', username: 'leo', position: 1 })]}
        me={[]}
        hasMore
        onLoadMore={vi.fn()}
        isLoadingMore
      />,
    )
    expect(screen.getByRole('button', { name: /Cargando/ })).toBeDisabled()
  })
})
