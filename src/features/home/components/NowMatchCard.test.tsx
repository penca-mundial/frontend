import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NowMatchCard } from '@/features/home/components/NowMatchCard'
import type { Match } from '@/features/matches/types'

vi.mock('@/features/home/hooks/useNowMatch', () => ({ useNowMatch: vi.fn() }))
// Stub the heavy match card: assert wiring, not its internals.
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
  it('titles the card "Ahora mismo" and renders the card when a match is live', () => {
    useNowMatchMock.mockReturnValue({ match, isLive: true, isLoading: false })
    render(<NowMatchCard />)

    expect(screen.getByRole('heading', { name: 'Ahora mismo' })).toBeInTheDocument()
    expect(screen.getByTestId('match-card')).toHaveTextContent('10')
  })

  it('titles the card "Próximo partido" for the scheduled fallback', () => {
    useNowMatchMock.mockReturnValue({ match, isLive: false, isLoading: false })
    render(<NowMatchCard />)

    expect(
      screen.getByRole('heading', { name: 'Próximo partido' }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('match-card')).toBeInTheDocument()
  })

  it('shows an empty note when nothing is live or upcoming', () => {
    useNowMatchMock.mockReturnValue({ match: null, isLive: false, isLoading: false })
    render(<NowMatchCard />)

    expect(screen.queryByTestId('match-card')).not.toBeInTheDocument()
    expect(screen.getByText(/No hay partidos/)).toBeInTheDocument()
  })
})
