import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MatchPage } from '@/pages/app/MatchPage'
import type { Match } from '@/features/matches/types'

vi.mock('@/features/matches/hooks/useMatch', () => ({ useMatch: vi.fn() }))
vi.mock('@/features/matches/hooks/useUpsertPrediction', () => ({
  useUpsertPrediction: vi.fn(),
}))
vi.mock('@/hooks/useToast', () => ({ toast: vi.fn() }))
vi.mock('@/api/auth.api', () => ({ getApiError: vi.fn(() => null) }))
vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({ currentUser: { timezone: 'UTC' } }),
}))

import { useMatch } from '@/features/matches/hooks/useMatch'
import { useUpsertPrediction } from '@/features/matches/hooks/useUpsertPrediction'

const useMatchMock = vi.mocked(useMatch)
const useUpsertPredictionMock = vi.mocked(useUpsertPrediction)

function makeMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: '10',
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

function mockMatch(value: {
  data?: Match
  isLoading?: boolean
  isError?: boolean
}) {
  useMatchMock.mockReturnValue({
    data: value.data,
    isLoading: value.isLoading ?? false,
    isError: value.isError ?? false,
  } as unknown as ReturnType<typeof useMatch>)
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/app/matches/10']}>
      <Routes>
        <Route path="/app/matches/:id" element={<MatchPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  useUpsertPredictionMock.mockReturnValue({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useUpsertPrediction>)
})

describe('MatchPage', () => {
  it('shows a skeleton while loading', () => {
    mockMatch({ isLoading: true })
    const { container } = renderPage()
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
  })

  it('shows an error message on failure', () => {
    mockMatch({ isError: true })
    renderPage()
    expect(screen.getByText(/No pudimos cargar el partido/i)).toBeInTheDocument()
  })

  it('renders the prediction form for an open match', () => {
    mockMatch({ data: makeMatch() })
    renderPage()
    expect(
      screen.getByRole('button', { name: /Guardar pronóstico/ }),
    ).toBeInTheDocument()
  })

  it('shows the live scoreboard and locks the prediction while live', () => {
    mockMatch({
      data: makeMatch({ status: 'live', homeScore: 1, awayScore: 1 }),
    })
    renderPage()
    expect(screen.getByText('EN VIVO')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Guardar pronóstico/ }),
    ).not.toBeInTheDocument()
  })

  it('shows the read-only lock view once finished', () => {
    mockMatch({
      data: makeMatch({
        status: 'finished',
        homeScore: 2,
        awayScore: 0,
        myPrediction: {
          id: 'p',
          matchId: '10',
          predictedHomeScore: 2,
          predictedAwayScore: 0,
          predictedAdvancingTeamId: null,
          lockedAt: null,
          locked: true,
        },
      }),
    })
    renderPage()
    expect(screen.getByText('Tu pronóstico')).toBeInTheDocument()
    expect(screen.getByText('✓ Resultado exacto')).toBeInTheDocument()
  })
})
