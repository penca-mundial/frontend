import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MyPredictionsPage } from '@/pages/app/MyPredictionsPage'
import type { Match } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'

vi.mock('@/features/predictions/hooks/usePredictions', () => ({
  usePredictions: vi.fn(),
}))
vi.mock('@/features/matches/hooks/useMatches', () => ({ useMatches: vi.fn() }))

import { usePredictions } from '@/features/predictions/hooks/usePredictions'
import { useMatches } from '@/features/matches/hooks/useMatches'

const usePredictionsMock = vi.mocked(usePredictions)
const useMatchesMock = vi.mocked(useMatches)

function makeMatch(id: string, overrides: Partial<Match> = {}): Match {
  return {
    id,
    externalId: null,
    tournamentId: '1',
    kickoffAt: '2020-06-12T19:00:00Z',
    status: 'finished',
    phase: 'group_stage',
    homeScore: 2,
    awayScore: 1,
    advancingTeamId: null,
    homeTeam: { id: '1', name: 'Uruguay', code3: 'URU', flagUrl: null },
    awayTeam: { id: '2', name: 'Argentina', code3: 'ARG', flagUrl: null },
    myPrediction: null,
    ...overrides,
  }
}

function makePrediction(id: string, matchId: string, h = 2, a = 1): Prediction {
  return {
    id,
    matchId,
    predictedHomeScore: h,
    predictedAwayScore: a,
    predictedAdvancingTeamId: null,
    lockedAt: null,
    locked: true,
  }
}

function mock(predictions: Prediction[], matches: Match[], state: { isLoading?: boolean; isError?: boolean } = {}) {
  usePredictionsMock.mockReturnValue({
    data: { predictions, totalCount: predictions.length, page: 1, perPage: 100 },
    isLoading: state.isLoading ?? false,
    isError: state.isError ?? false,
  } as unknown as ReturnType<typeof usePredictions>)
  useMatchesMock.mockReturnValue({
    data: { matches, totalCount: matches.length, page: 1, perPage: 100 },
  } as unknown as ReturnType<typeof useMatches>)
}

function renderPage() {
  return render(
    <MemoryRouter>
      <MyPredictionsPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MyPredictionsPage', () => {
  it('shows the empty state when there are no predictions', () => {
    mock([], [])
    renderPage()
    expect(
      screen.getByText('Todavía no hiciste pronósticos.'),
    ).toBeInTheDocument()
  })

  it('joins predictions with matches and shows the exact-result status', () => {
    mock([makePrediction('p1', '10', 2, 1)], [makeMatch('10')])
    renderPage()
    expect(screen.getByText('Uruguay vs Argentina')).toBeInTheDocument()
    expect(screen.getByText('Exacto')).toBeInTheDocument()
    // The prediction and the real result are both 2-1 for an exact hit.
    expect(screen.getAllByText('2-1')).toHaveLength(2)
  })

  it('filters by phase', async () => {
    const user = userEvent.setup()
    mock(
      [makePrediction('p1', '10'), makePrediction('p2', '20')],
      [
        makeMatch('10', { phase: 'group_stage' }),
        makeMatch('20', { phase: 'round_of_32' }),
      ],
    )
    renderPage()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'Dieciseisavos' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  it('paginates when there are more than a page of predictions', async () => {
    const user = userEvent.setup()
    const predictions = Array.from({ length: 12 }, (_, i) =>
      makePrediction(`p${i}`, `${i}`),
    )
    const matches = Array.from({ length: 12 }, (_, i) => makeMatch(`${i}`))
    mock(predictions, matches)
    renderPage()

    expect(screen.getAllByRole('listitem')).toHaveLength(10)
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })
})
