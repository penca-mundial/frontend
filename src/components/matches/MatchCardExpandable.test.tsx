import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MatchCardExpandable } from '@/components/matches/MatchCardExpandable'
import type { Match } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'

vi.mock('@/hooks/useMediaQuery', () => ({ useMediaQuery: vi.fn() }))
vi.mock('@/api/predictions.api', () => ({
  predictionsApi: { upsert: vi.fn() },
}))
vi.mock('@/hooks/useToast', () => ({ toast: vi.fn() }))
vi.mock('@/api/auth.api', () => ({ getApiError: vi.fn(() => null) }))

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { predictionsApi } from '@/api/predictions.api'
import { toast } from '@/hooks/useToast'

const useMediaQueryMock = vi.mocked(useMediaQuery)
const upsert = vi.mocked(predictionsApi.upsert)
const toastMock = vi.mocked(toast)

function makePrediction(overrides: Partial<Prediction> = {}): Prediction {
  return {
    id: 'p1',
    matchId: '10',
    predictedHomeScore: 2,
    predictedAwayScore: 1,
    predictedAdvancingTeamId: null,
    lockedAt: null,
    locked: false,
    ...overrides,
  }
}

function makeMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: '10',
    externalId: 'ext-10',
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

function renderCard(match: Match) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MatchCardExpandable match={match} timezone="UTC" />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  useMediaQueryMock.mockReturnValue(true) // desktop by default
})

describe('MatchCardExpandable', () => {
  it('shows phase, teams and a Predecir button when collapsed without a prediction', () => {
    renderCard(makeMatch())
    expect(screen.getByText('Fase de grupos')).toBeInTheDocument()
    expect(screen.getAllByText('Uruguay').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Predecir' })).toBeInTheDocument()
    expect(screen.queryByText(/Tu pronóstico/)).not.toBeInTheDocument()
  })

  it('shows the existing prediction and an Editar button', () => {
    renderCard(makeMatch({ myPrediction: makePrediction() }))
    expect(screen.getByText(/Tu pronóstico/)).toBeInTheDocument()
    expect(screen.getByText('2-1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
  })

  it('translates the first knockout phase as "Dieciseisavos"', () => {
    renderCard(makeMatch({ phase: 'round_of_32' }))
    expect(screen.getByText('Dieciseisavos')).toBeInTheDocument()
  })

  it('expands inline on desktop, submits and collapses showing the new prediction', async () => {
    const user = userEvent.setup()
    upsert.mockResolvedValueOnce(
      makePrediction({
        id: 'p9',
        predictedHomeScore: 1,
        predictedAwayScore: 0,
      }),
    )
    renderCard(makeMatch())

    await user.click(screen.getByRole('button', { name: 'Predecir' }))
    await user.click(screen.getByRole('button', { name: 'Sumar gol: Uruguay' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(upsert).toHaveBeenCalledWith({
        match_id: '10',
        predicted_home_score: 1,
        predicted_away_score: 0,
        predicted_advancing_team_id: undefined,
      }),
    )
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: '¡Pronóstico guardado!' }),
    )
    expect(await screen.findByText('1-0')).toBeInTheDocument()
  })

  it('shows a red toast and keeps the editor open on error', async () => {
    const user = userEvent.setup()
    upsert.mockRejectedValueOnce(new Error('boom'))
    renderCard(makeMatch())

    await user.click(screen.getByRole('button', { name: 'Predecir' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'destructive' }),
      ),
    )
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  it('locks read-only with no Predecir button once the match is not scheduled', () => {
    renderCard(makeMatch({ status: 'finished' }))
    expect(screen.getByText('Sin pronóstico')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Predecir' }),
    ).not.toBeInTheDocument()
  })

  it('shows a locked prediction read-only without an edit button', () => {
    renderCard(
      makeMatch({
        status: 'finished',
        myPrediction: makePrediction({ locked: true }),
      }),
    )
    expect(screen.getByText('2-1')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Editar' }),
    ).not.toBeInTheDocument()
  })

  it('requires an advancing team for knockout matches before saving', async () => {
    const user = userEvent.setup()
    upsert.mockResolvedValueOnce(
      makePrediction({ predictedAdvancingTeamId: '1' }),
    )
    renderCard(makeMatch({ phase: 'round_of_32' }))

    await user.click(screen.getByRole('button', { name: 'Predecir' }))
    expect(
      screen.getByRole('radiogroup', { name: '¿Quién pasa de ronda?' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: 'Uruguay' }))
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    await waitFor(() =>
      expect(upsert).toHaveBeenCalledWith(
        expect.objectContaining({ predicted_advancing_team_id: '1' }),
      ),
    )
  })

  it('opens a bottom sheet on mobile', async () => {
    const user = userEvent.setup()
    useMediaQueryMock.mockReturnValue(false)
    renderCard(makeMatch())

    await user.click(screen.getByRole('button', { name: 'Predecir' }))

    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByRole('button', { name: 'Guardar' }),
    ).toBeInTheDocument()
  })
})
