import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MyPositionBlock } from '@/features/rankings/components/MyPositionBlock'
import type { RankingEntry } from '@/types/domain'

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

describe('MyPositionBlock', () => {
  it('keeps the surface positioned at every breakpoint (texture containment)', () => {
    // Regression (SCRUM-297): BrandSurface contains its absolute inset-0
    // texture overlays via its own `relative`, but tailwind-merge drops it
    // when the caller passes another position class. `md:static` left the
    // element unpositioned on desktop, so the overlays anchored to the
    // viewport and painted a gray gradient over the whole page.
    const { container } = render(
      <MyPositionBlock
        entries={[ent({ userId: '9', position: 1, points: 10 })]}
        me={[ent({ userId: '9', position: 1, points: 10 })]}
      />,
    )

    const surface = container.firstElementChild!
    expect(surface.className).not.toMatch(/md:static/)
    // Sticky on mobile + positioned (relative) on desktop.
    expect(surface.className).toMatch(/sticky/)
    expect(surface.className).toMatch(/md:relative/)
  })

  it('shows the rank, points and the gap to the leader', () => {
    render(
      <MyPositionBlock
        entries={[ent({ userId: '1', position: 1, points: 134 })]}
        me={[
          ent({ userId: '5', position: 11, points: 36 }),
          ent({ userId: '9', position: 12, points: 35 }),
        ]}
      />,
    )

    expect(screen.getByText('TU POSICIÓN')).toBeInTheDocument()
    expect(screen.getByText('12º')).toBeInTheDocument()
    expect(screen.getByText('35')).toBeInTheDocument()
    expect(screen.getByText('A 99 pts del 1º')).toBeInTheDocument()
  })

  it('uses the singular "pt" for a 1-point gap', () => {
    render(
      <MyPositionBlock
        entries={[ent({ userId: '1', position: 1, points: 36 })]}
        me={[ent({ userId: '9', position: 2, points: 35 })]}
      />,
    )
    expect(screen.getByText('A 1 pt del 1º')).toBeInTheDocument()
  })

  it('shows "Liderás la tabla" when the user is first', () => {
    render(
      <MyPositionBlock
        entries={[ent({ userId: '9', position: 1, points: 35 })]}
        me={[ent({ userId: '9', position: 1, points: 35 })]}
      />,
    )
    expect(screen.getByText('Liderás la tabla')).toBeInTheDocument()
    expect(screen.queryByText(/del 1º/)).not.toBeInTheDocument()
  })

  it("falls back to the user's row in the top entries when the me window is empty", () => {
    render(
      <MyPositionBlock
        entries={[
          ent({ userId: '1', position: 1, points: 50 }),
          ent({ userId: '9', position: 2, points: 40 }),
        ]}
        me={[]}
      />,
    )
    expect(screen.getByText('2º')).toBeInTheDocument()
    expect(screen.getByText('A 10 pts del 1º')).toBeInTheDocument()
  })

  it('renders nothing when the user has no row', () => {
    const { container } = render(
      <MyPositionBlock entries={[ent({ userId: '1' })]} me={[]} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows a skeleton while loading', () => {
    const { container } = render(
      <MyPositionBlock entries={[]} me={[]} isLoading />,
    )
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull()
  })
})
