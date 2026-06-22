import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NowMatchCard } from '@/features/home/components/NowMatchCard'
import type { Match } from '@/features/matches/types'

vi.mock('@/features/home/hooks/useNowMatch', () => ({ useNowMatch: vi.fn() }))
// Stub the heavy child cards: assert routing between states, not their internals.
vi.mock('@/features/home/components/LiveMatchCard', () => ({
  LiveMatchCard: ({ match }: { match: Match }) => (
    <div data-testid="live-card">{match.id}</div>
  ),
}))
vi.mock('@/components/matches/MatchCardExpandable', () => ({
  MatchCardExpandable: ({ match }: { match: Match }) => (
    <div data-testid="match-card">{match.id}</div>
  ),
}))

import { useNowMatch } from '@/features/home/hooks/useNowMatch'

const useNowMatchMock = vi.mocked(useNowMatch)

const match = { id: '10' } as Match

beforeEach(() => vi.clearAllMocks())

describe('NowMatchCard', () => {
  it('renders the live card when a match is in play', () => {
    useNowMatchMock.mockReturnValue({
      liveMatches: [match],
      nextMatch: null,
      isLoading: false,
    })
    render(<NowMatchCard />)

    expect(screen.getByTestId('live-card')).toHaveTextContent('10')
    expect(screen.queryByTestId('match-card')).not.toBeInTheDocument()
  })

  it('stacks a live card per fixture when matches run concurrently', () => {
    useNowMatchMock.mockReturnValue({
      liveMatches: [match, { id: '11' } as Match],
      nextMatch: null,
      isLoading: false,
    })
    render(<NowMatchCard />)

    const cards = screen.getAllByTestId('live-card')
    expect(cards).toHaveLength(2)
    expect(cards.map((c) => c.textContent)).toEqual(['10', '11'])
  })

  it('renders the predictable card under "Próximo partido" for the scheduled fallback', () => {
    useNowMatchMock.mockReturnValue({
      liveMatches: [],
      nextMatch: match,
      isLoading: false,
    })
    render(<NowMatchCard />)

    expect(
      screen.getByRole('heading', { name: 'Próximo partido' }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('match-card')).toHaveTextContent('10')
    expect(screen.queryByTestId('live-card')).not.toBeInTheDocument()
  })

  it('shows an empty note when nothing is live or upcoming', () => {
    useNowMatchMock.mockReturnValue({
      liveMatches: [],
      nextMatch: null,
      isLoading: false,
    })
    render(<NowMatchCard />)

    expect(screen.queryByTestId('match-card')).not.toBeInTheDocument()
    expect(screen.getByText(/No hay partidos/)).toBeInTheDocument()
  })
})
