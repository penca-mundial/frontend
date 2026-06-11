import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LastResultCard } from '@/features/home/components/LastResultCard'
import type { Match } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'

vi.mock('@/features/home/hooks/useLastFinishedMatch', () => ({
  useLastFinishedMatch: vi.fn(),
}))

import { useLastFinishedMatch } from '@/features/home/hooks/useLastFinishedMatch'

const useLastFinishedMatchMock = vi.mocked(useLastFinishedMatch)

function prediction(home: number, away: number): Prediction {
  return {
    id: 'p1',
    matchId: '10',
    predictedHomeScore: home,
    predictedAwayScore: away,
    predictedAdvancingTeamId: null,
    lockedAt: null,
    locked: true,
  }
}

function finishedMatch(myPrediction: Prediction | null): Match {
  return {
    id: '10',
    externalId: null,
    tournamentId: '1',
    kickoffAt: '2026-06-12T19:00:00Z',
    status: 'finished',
    phase: 'group_stage',
    group: 'A',
    minute: null,
    homeScore: 2,
    awayScore: 1,
    advancingTeamId: null,
    homeTeam: { id: '1', name: 'Uruguay', code3: 'URU', flagUrl: null },
    awayTeam: { id: '2', name: 'Argentina', code3: 'ARG', flagUrl: null },
    myPrediction,
  }
}

beforeEach(() => vi.clearAllMocks())

describe('LastResultCard', () => {
  it('shows the result and an "¡Exacto!" outcome for a spot-on prediction', () => {
    useLastFinishedMatchMock.mockReturnValue({
      match: finishedMatch(prediction(2, 1)),
      isLoading: false,
    })

    render(<LastResultCard timezone="UTC" />)

    expect(screen.getByText('Uruguay')).toBeInTheDocument()
    expect(screen.getByText('Argentina')).toBeInTheDocument()
    expect(screen.getByText(/Tu pronóstico: 2 – 1/)).toBeInTheDocument()
    expect(screen.getByText('¡Exacto!')).toBeInTheDocument()
  })

  it('shows "Errado" when the outcome is wrong', () => {
    useLastFinishedMatchMock.mockReturnValue({
      match: finishedMatch(prediction(0, 3)),
      isLoading: false,
    })

    render(<LastResultCard timezone="UTC" />)

    expect(screen.getByText('Errado')).toBeInTheDocument()
  })

  it('notes when the user did not predict, and when nothing has finished', () => {
    useLastFinishedMatchMock.mockReturnValue({
      match: finishedMatch(null),
      isLoading: false,
    })
    const { rerender } = render(<LastResultCard timezone="UTC" />)
    expect(screen.getByText(/No pronosticaste/)).toBeInTheDocument()

    useLastFinishedMatchMock.mockReturnValue({ match: null, isLoading: false })
    rerender(<LastResultCard timezone="UTC" />)
    expect(
      screen.getByText(/Todavía no hay partidos finalizados/),
    ).toBeInTheDocument()
  })
})
