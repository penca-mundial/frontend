import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FixturePage } from '@/pages/app/FixturePage'
import type { Match } from '@/features/matches/types'

vi.mock('@/features/matches/hooks/useMatches', () => ({ useMatches: vi.fn() }))
vi.mock('@/features/predictions/hooks/usePredictions', () => ({
  usePredictions: vi.fn(),
}))
vi.mock('@/lib/timezone', () => ({ detectUserTimezone: () => 'UTC' }))

import { useMatches } from '@/features/matches/hooks/useMatches'
import { usePredictions } from '@/features/predictions/hooks/usePredictions'

const useMatchesMock = vi.mocked(useMatches)
const usePredictionsMock = vi.mocked(usePredictions)

function mockQuery(value: {
  data?: { matches: Match[]; totalCount: number; page: number; perPage: number }
  isLoading?: boolean
  isError?: boolean
}) {
  useMatchesMock.mockReturnValue({
    data: value.data,
    isLoading: value.isLoading ?? false,
    isError: value.isError ?? false,
  } as unknown as ReturnType<typeof useMatches>)
}

function makeMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: Math.random().toString(36).slice(2),
    externalId: null,
    tournamentId: '1',
    kickoffAt: '2099-06-12T19:00:00Z',
    status: 'scheduled',
    phase: 'group_stage',
    homeScore: null,
    awayScore: null,
    advancingTeamId: null,
    homeTeam: { id: '1', name: 'Uruguay', code3: 'URU', flagUrl: null },
    awayTeam: { id: '2', name: 'Argentina', code3: 'ARG', flagUrl: null },
    myPrediction: null,
    ...overrides,
  }
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <FixturePage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  usePredictionsMock.mockReturnValue({
    data: { predictions: [], totalCount: 0, page: 1, perPage: 100 },
  } as unknown as ReturnType<typeof usePredictions>)
})

describe('FixturePage', () => {
  it('shows skeletons while loading the calendar', () => {
    mockQuery({ isLoading: true })
    const { container } = renderPage()
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
  })

  it('shows an error message on failure', () => {
    mockQuery({ isError: true })
    renderPage()
    expect(
      screen.getByText(/No pudimos cargar los partidos/i),
    ).toBeInTheDocument()
  })

  it('shows an empty-state message when there are no matches', () => {
    mockQuery({ data: { matches: [], totalCount: 0, page: 1, perPage: 100 } })
    renderPage()
    expect(
      screen.getByText(/No hay partidos para estos filtros/i),
    ).toBeInTheDocument()
  })

  it('renders the three fixture tabs and a card per match on Calendario', () => {
    mockQuery({
      data: {
        matches: [makeMatch(), makeMatch()],
        totalCount: 2,
        page: 1,
        perPage: 100,
      },
    })
    renderPage()
    expect(screen.getByRole('tab', { name: 'Calendario' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Grupos' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Eliminación' })).toBeInTheDocument()
    expect(screen.getAllByText('Uruguay')).toHaveLength(2)
  })

  it('shows the placeholder on the Grupos tab', async () => {
    const user = userEvent.setup()
    mockQuery({
      data: { matches: [makeMatch()], totalCount: 1, page: 1, perPage: 100 },
    })
    renderPage()

    await user.click(screen.getByRole('tab', { name: 'Grupos' }))
    expect(
      screen.getByText(/Los grupos se mostrarán cuando se publique/i),
    ).toBeInTheDocument()
  })

  it('renders group composition cards on the Grupos tab when matches carry a group', async () => {
    const user = userEvent.setup()
    mockQuery({
      data: {
        matches: [makeMatch({ group: 'A' })],
        totalCount: 1,
        page: 1,
        perPage: 100,
      },
    })
    renderPage()

    await user.click(screen.getByRole('tab', { name: 'Grupos' }))
    expect(screen.getByText('Grupo A')).toBeInTheDocument()
    expect(screen.getByText('Uruguay')).toBeInTheDocument()
    expect(screen.getByText('Argentina')).toBeInTheDocument()
    expect(
      screen.queryByText(/Los grupos se mostrarán/i),
    ).not.toBeInTheDocument()
  })

  it('shows the bracket empty-state on Eliminación when there are no knockout matches', async () => {
    const user = userEvent.setup()
    mockQuery({
      data: { matches: [makeMatch()], totalCount: 1, page: 1, perPage: 100 },
    })
    renderPage()

    await user.click(screen.getByRole('tab', { name: 'Eliminación' }))
    expect(
      screen.getByText(/El cuadro de eliminación todavía no está disponible/i),
    ).toBeInTheDocument()
  })
})
