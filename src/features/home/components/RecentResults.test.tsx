import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RecentResults } from '@/features/home/components/RecentResults'
import type { Match } from '@/features/matches/types'

vi.mock('@/features/home/hooks/useRecentFinishedMatches', () => ({
  useRecentFinishedMatches: vi.fn(),
}))
// Stub the card: assert the container's count + eyebrow wiring, not its internals.
vi.mock('@/features/home/components/ResultCard', () => ({
  ResultCard: ({ match, showEyebrow }: { match: Match; showEyebrow?: boolean }) => (
    <div data-testid="result" data-eyebrow={String(Boolean(showEyebrow))}>
      {match.id}
    </div>
  ),
}))

import { useRecentFinishedMatches } from '@/features/home/hooks/useRecentFinishedMatches'

const useRecentMock = vi.mocked(useRecentFinishedMatches)
const match = (id: string) => ({ id }) as Match

beforeEach(() => vi.clearAllMocks())

describe('RecentResults', () => {
  it('renders a card per finished match, only the first with the eyebrow', () => {
    useRecentMock.mockReturnValue({
      matches: [match('3'), match('2'), match('1')],
      isLoading: false,
    })

    render(<RecentResults />)

    const cards = screen.getAllByTestId('result')
    expect(cards).toHaveLength(3)
    expect(cards[0]).toHaveAttribute('data-eyebrow', 'true')
    expect(cards[1]).toHaveAttribute('data-eyebrow', 'false')
    expect(cards[2]).toHaveAttribute('data-eyebrow', 'false')
  })

  it('renders nothing (no empty state) when there are no finished matches', () => {
    useRecentMock.mockReturnValue({ matches: [], isLoading: false })
    const { container } = render(<RecentResults />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing while loading', () => {
    useRecentMock.mockReturnValue({ matches: [], isLoading: true })
    const { container } = render(<RecentResults />)
    expect(container).toBeEmptyDOMElement()
  })
})
