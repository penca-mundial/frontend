import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { formatInTimeZone } from 'date-fns-tz'
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
vi.mock('@/features/matches/hooks/useStandings', () => ({
  useStandings: vi.fn(),
}))

import { useMatches } from '@/features/matches/hooks/useMatches'
import { usePredictions } from '@/features/predictions/hooks/usePredictions'
import { useStandings } from '@/features/matches/hooks/useStandings'
import type { GroupStandings } from '@/features/matches/types'

const useMatchesMock = vi.mocked(useMatches)
const usePredictionsMock = vi.mocked(usePredictions)
const useStandingsMock = vi.mocked(useStandings)

function mockStandings(
  groups: GroupStandings[] | undefined,
  state: { isLoading?: boolean; isError?: boolean } = {},
) {
  useStandingsMock.mockReturnValue({
    data: groups,
    isLoading: state.isLoading ?? false,
    isError: state.isError ?? false,
  } as unknown as ReturnType<typeof useStandings>)
}

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
  mockStandings(undefined)
})

describe('FixturePage date filter default (SCRUM-289)', () => {
  it('defaults "Desde" to today in the user timezone and leaves "Hasta" empty', () => {
    mockQuery({
      data: { matches: [makeMatch()], totalCount: 1, page: 1, perPage: 100 },
    })
    renderPage()

    // The timezone mock pins 'UTC', so today's key is the UTC calendar day.
    const today = formatInTimeZone(new Date(), 'UTC', 'yyyy-MM-dd')
    expect(screen.getByLabelText('Desde')).toHaveValue(today)
    expect(screen.getByLabelText('Hasta')).toHaveValue('')
  })

  it('hides matches before today by default, showing today onwards', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    mockQuery({
      data: {
        matches: [
          makeMatch({
            kickoffAt: yesterday,
            homeTeam: { id: '9', name: 'Ayerlandia', code3: 'AYE', flagUrl: null },
          }),
          makeMatch(), // 2099 — far future
        ],
        totalCount: 2,
        page: 1,
        perPage: 100,
      },
    })
    renderPage()

    expect(screen.queryByText('Ayerlandia')).not.toBeInTheDocument()
    expect(screen.getByText('Uruguay')).toBeInTheDocument()
  })

  it("respects the user's own date once they change the filter", async () => {
    const user = userEvent.setup()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    mockQuery({
      data: {
        matches: [
          makeMatch({
            kickoffAt: yesterday.toISOString(),
            homeTeam: { id: '9', name: 'Ayerlandia', code3: 'AYE', flagUrl: null },
          }),
        ],
        totalCount: 1,
        page: 1,
        perPage: 100,
      },
    })
    renderPage()
    expect(screen.queryByText('Ayerlandia')).not.toBeInTheDocument()

    // Widen the range to include yesterday — the user's choice wins.
    const yesterdayKey = formatInTimeZone(yesterday, 'UTC', 'yyyy-MM-dd')
    const fromInput = screen.getByLabelText('Desde')
    await user.clear(fromInput)
    await user.type(fromInput, yesterdayKey)
    expect(screen.getByText('Ayerlandia')).toBeInTheDocument()
  })
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

  it('renders a GroupStandingsCard per group from the standings endpoint', async () => {
    const user = userEvent.setup()
    mockQuery({
      data: {
        matches: [makeMatch({ group: 'A' })],
        totalCount: 1,
        page: 1,
        perPage: 100,
      },
    })
    mockStandings([
      {
        group: 'A',
        rows: [
          {
            id: 's1',
            group: 'A',
            position: 1,
            playedGames: 1,
            won: 1,
            draw: 0,
            lost: 0,
            goalsFor: 2,
            goalsAgainst: 1,
            goalDifference: 1,
            points: 3,
            form: 'W',
            team: { id: '1', name: 'Uruguay', code3: 'URU', flagUrl: null },
          },
          {
            id: 's2',
            group: 'A',
            position: 2,
            playedGames: 1,
            won: 0,
            draw: 0,
            lost: 1,
            goalsFor: 1,
            goalsAgainst: 2,
            goalDifference: -1,
            points: 0,
            form: 'L',
            team: { id: '2', name: 'Argentina', code3: 'ARG', flagUrl: null },
          },
        ],
      },
    ])
    renderPage()

    await user.click(screen.getByRole('tab', { name: 'Grupos' }))
    expect(screen.getByText('Grupo A')).toBeInTheDocument()
    expect(screen.getByText('Uruguay')).toBeInTheDocument()
    expect(screen.getByText('Argentina')).toBeInTheDocument()
    expect(
      screen.queryByText(/Los grupos se mostrarán/i),
    ).not.toBeInTheDocument()
  })

  it('renders the pre-tournament groups (all stats at 0) instead of the placeholder', async () => {
    const user = userEvent.setup()
    // The computed endpoint returns the 12 groups with their teams at 0
    // pre-tournament — so the tab must show the tables, not "Próximamente".
    const letters = 'ABCDEFGHIJKL'.split('')
    mockQuery({
      data: { matches: [makeMatch({ group: 'A' })], totalCount: 1, page: 1, perPage: 100 },
    })
    mockStandings(
      letters.map((letter) => ({
        group: letter,
        rows: [
          {
            id: `${letter}-1`,
            group: letter,
            position: 1,
            playedGames: 0,
            won: 0,
            draw: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
            form: null,
            team: { id: `${letter}1`, name: `Equipo ${letter}`, code3: letter.repeat(3), flagUrl: null },
          },
        ],
      })),
    )
    renderPage()

    await user.click(screen.getByRole('tab', { name: 'Grupos' }))
    expect(screen.getByText('Grupo A')).toBeInTheDocument()
    expect(screen.getByText('Grupo L')).toBeInTheDocument()
    expect(screen.getAllByText(/^Grupo [A-L]$/)).toHaveLength(12)
    expect(
      screen.queryByText(/Los grupos se mostrarán/i),
    ).not.toBeInTheDocument()
  })

  it('requests the projected standings variant for the Grupos tab', async () => {
    const user = userEvent.setup()
    mockQuery({
      data: { matches: [makeMatch({ group: 'A' })], totalCount: 1, page: 1, perPage: 100 },
    })
    renderPage()

    await user.click(screen.getByRole('tab', { name: 'Grupos' }))
    expect(useStandingsMock).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({ projected: true }),
    )
  })

  it('shows the "Según tus pronósticos" note above the group tables', async () => {
    const user = userEvent.setup()
    mockQuery({
      data: { matches: [makeMatch({ group: 'A' })], totalCount: 1, page: 1, perPage: 100 },
    })
    mockStandings([
      {
        group: 'A',
        rows: [
          {
            id: 's1',
            group: 'A',
            position: 1,
            playedGames: 0,
            won: 0,
            draw: 0,
            lost: 0,
            goalsFor: 2,
            goalsAgainst: 0,
            goalDifference: 2,
            points: 3, // projected points with nothing played — the hybrid
            form: null,
            team: { id: '1', name: 'Uruguay', code3: 'URU', flagUrl: null },
          },
        ],
      },
    ])
    renderPage()

    await user.click(screen.getByRole('tab', { name: 'Grupos' }))
    expect(screen.getByText(/Según tus pronósticos/i)).toBeInTheDocument()
    expect(screen.getByText('Grupo A')).toBeInTheDocument()
  })

  it('shows an error message (not the "Próximamente" placeholder) when standings fail', async () => {
    const user = userEvent.setup()
    mockQuery({
      data: { matches: [makeMatch({ group: 'A' })], totalCount: 1, page: 1, perPage: 100 },
    })
    mockStandings(undefined, { isError: true })
    renderPage()

    await user.click(screen.getByRole('tab', { name: 'Grupos' }))
    expect(
      screen.getByText(/No pudimos cargar las posiciones/i),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/Los grupos se mostrarán/i),
    ).not.toBeInTheDocument()
  })

  it('shows a skeleton (not the placeholder) while standings load', async () => {
    const user = userEvent.setup()
    mockQuery({
      data: { matches: [makeMatch()], totalCount: 1, page: 1, perPage: 100 },
    })
    useStandingsMock.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useStandings>)
    const { container } = renderPage()

    await user.click(screen.getByRole('tab', { name: 'Grupos' }))
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull()
    expect(
      screen.queryByText(/Los grupos se mostrarán/i),
    ).not.toBeInTheDocument()
  })

  it('shows the elimination empty-state when there are no knockout matches', async () => {
    const user = userEvent.setup()
    mockQuery({
      data: { matches: [makeMatch()], totalCount: 1, page: 1, perPage: 100 },
    })
    renderPage()

    await user.click(screen.getByRole('tab', { name: 'Eliminación' }))
    expect(
      screen.getByText(/Las eliminatorias se publicarán/i),
    ).toBeInTheDocument()
  })
})
