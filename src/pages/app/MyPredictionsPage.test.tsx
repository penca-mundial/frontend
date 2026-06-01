import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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

function mock(
  predictions: Prediction[],
  matches: Match[],
  state: { isLoading?: boolean; isError?: boolean } = {},
) {
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
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <MyPredictionsPage />
      </MemoryRouter>
    </QueryClientProvider>,
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

  it('links to the tournament prediction page', () => {
    mock([], [])
    renderPage()

    const link = screen.getByRole('link', { name: /Pronóstico del torneo/ })
    expect(link).toHaveAttribute('href', '/app/predictions/tournament')
  })

  it('renders a read-only card per prediction joined with its match', () => {
    mock([makePrediction('p1', '10', 2, 1)], [makeMatch('10')])
    renderPage()

    expect(screen.getByText('Uruguay')).toBeInTheDocument()
    expect(screen.getByText('Argentina')).toBeInTheDocument()
    expect(screen.getByText(/Tu pronóstico/).textContent).toContain('2 – 1')
    // Read-only: cards aren't buttons, so only the 5 status filters are.
    expect(screen.getAllByRole('button')).toHaveLength(5)
  })

  it('summarises predictions in the stats card', () => {
    mock([makePrediction('p1', '10', 2, 1)], [makeMatch('10')])
    renderPage()

    expect(screen.getByText('Pronosticados')).toBeInTheDocument()
    expect(screen.getByText('de 1')).toBeInTheDocument()
    expect(screen.getByText('Exactos')).toBeInTheDocument()
    expect(screen.getByText('Parciales')).toBeInTheDocument()
    // Points stay "—" until the backend exposes points_earned (SCRUM-258).
    expect(screen.getByText('Puntos')).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('filters by match status', async () => {
    const user = userEvent.setup()
    mock(
      [makePrediction('p1', '10', 2, 1), makePrediction('p2', '20', 1, 0)],
      [
        makeMatch('10'), // finished, exact hit
        makeMatch('20', {
          status: 'scheduled',
          homeScore: null,
          awayScore: null,
          kickoffAt: '2099-06-12T19:00:00Z',
        }),
      ],
    )
    renderPage()
    expect(screen.getAllByText(/Tu pronóstico/)).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'Próximos' }))
    expect(screen.getAllByText(/Tu pronóstico/)).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Aciertos' }))
    expect(screen.getAllByText(/Tu pronóstico/)).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'En vivo' }))
    expect(screen.queryByText(/Tu pronóstico/)).not.toBeInTheDocument()
    expect(
      screen.getByText('No hay pronósticos para este filtro.'),
    ).toBeInTheDocument()
  })
})
