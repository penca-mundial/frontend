import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RankingCard } from '@/features/home/components/RankingCard'

vi.mock('@/features/home/hooks/useMyRanking', () => ({ useMyRanking: vi.fn() }))

import { useMyRanking } from '@/features/home/hooks/useMyRanking'

const useMyRankingMock = vi.mocked(useMyRanking)

function renderCard() {
  return render(
    <MemoryRouter>
      <RankingCard />
    </MemoryRouter>,
  )
}

beforeEach(() => vi.clearAllMocks())

describe('RankingCard', () => {
  it('shows the position, total and points, linking to the leaderboard', () => {
    useMyRankingMock.mockReturnValue({
      position: 12,
      points: 340,
      total: 1247,
      isLoading: false,
      isError: false,
    })

    renderCard()

    expect(screen.getByText('12º')).toBeInTheDocument()
    expect(screen.getByText(/de 1\.247 jugadores/)).toBeInTheDocument()
    expect(screen.getByText('340')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ver ranking/ })).toHaveAttribute(
      'href',
      '/app/rankings',
    )
  })

  it('shows a placeholder when the user has no ranked row yet', () => {
    useMyRankingMock.mockReturnValue({
      position: null,
      points: null,
      total: null,
      isLoading: false,
      isError: false,
    })

    renderCard()

    expect(
      screen.getByText(/Todavía no tenés posición/),
    ).toBeInTheDocument()
  })
})
