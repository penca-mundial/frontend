import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MatchCardExpandable } from '@/components/matches/MatchCardExpandable'
import type { Match } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'

vi.mock('@/hooks/useMediaQuery', () => ({ useMediaQuery: vi.fn() }))
vi.mock('@/features/matches/hooks/useUpsertPrediction', () => ({
  useUpsertPrediction: vi.fn(),
}))
vi.mock('@/hooks/useToast', () => ({ toast: vi.fn() }))
vi.mock('@/api/auth.api', () => ({ getApiError: vi.fn(() => null) }))

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useUpsertPrediction } from '@/features/matches/hooks/useUpsertPrediction'
import { toast } from '@/hooks/useToast'

const useMediaQueryMock = vi.mocked(useMediaQuery)
const useUpsertPredictionMock = vi.mocked(useUpsertPrediction)
const toastMock = vi.mocked(toast)
const mutateAsync = vi.fn()

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

function renderCard(props: {
  match?: Match
  prediction?: Prediction | null
}) {
  return render(
    <MatchCardExpandable
      match={props.match ?? makeMatch()}
      prediction={props.prediction ?? null}
      timezone="UTC"
    />,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  useMediaQueryMock.mockReturnValue(true) // desktop by default
  useUpsertPredictionMock.mockReturnValue({
    mutateAsync,
    isPending: false,
  } as unknown as ReturnType<typeof useUpsertPrediction>)
})

describe('MatchCardExpandable', () => {
  it('shows phase, teams and a Predecir affordance when open without a prediction', () => {
    renderCard({})
    expect(screen.getByText('Fase de grupos')).toBeInTheDocument()
    expect(screen.getByText('Uruguay')).toBeInTheDocument()
    expect(screen.getByText('Argentina')).toBeInTheDocument()
    expect(screen.getByText('Predecir')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument() // whole card clickable
  })

  it('shows the existing prediction chip', () => {
    renderCard({ prediction: makePrediction() })
    expect(screen.getByText(/Tu pronóstico/).textContent).toContain('2 – 1')
  })

  it('translates round_of_32 as "Dieciseisavos"', () => {
    renderCard({ match: makeMatch({ phase: 'round_of_32' }) })
    expect(screen.getByText('Dieciseisavos')).toBeInTheDocument()
  })

  it('shows the group letter as the eyebrow when present', () => {
    renderCard({ match: makeMatch({ group: 'A' }) })
    expect(screen.getByText('Grupo A')).toBeInTheDocument()
  })

  it('omits the kickoff date by default but shows it with showDate', () => {
    const match = makeMatch({ group: 'A' }) // 2099-06-12T19:00:00Z
    const { rerender } = render(
      <MatchCardExpandable match={match} prediction={null} timezone="UTC" />,
    )
    // Default: only the time, no date.
    expect(screen.getByText('19:00')).toBeInTheDocument()
    expect(screen.queryByText(/12 jun/i)).not.toBeInTheDocument()

    rerender(
      <MatchCardExpandable
        match={match}
        prediction={null}
        timezone="UTC"
        showDate
      />,
    )
    expect(screen.getByText('19:00')).toBeInTheDocument()
    expect(screen.getByText(/12 jun/i)).toBeInTheDocument()
  })

  it('renders the live minute in the EN VIVO badge', () => {
    renderCard({
      match: makeMatch({
        status: 'live',
        minute: 67,
        homeScore: 1,
        awayScore: 0,
      }),
    })
    expect(screen.getByText(/EN VIVO · 67'/)).toBeInTheDocument()
  })

  it('omits the minute when live but not yet synced', () => {
    renderCard({
      match: makeMatch({
        status: 'live',
        minute: null,
        homeScore: 0,
        awayScore: 0,
      }),
    })
    expect(screen.getByText('EN VIVO')).toBeInTheDocument()
  })

  it('expands inline on desktop, saves and shows the new prediction', async () => {
    const user = userEvent.setup()
    mutateAsync.mockResolvedValueOnce(
      makePrediction({ predictedHomeScore: 1, predictedAwayScore: 0 }),
    )
    renderCard({})

    await user.click(screen.getByRole('button')) // open the card
    await user.click(screen.getByRole('button', { name: 'Sumar gol: Uruguay' }))
    await user.click(screen.getByRole('button', { name: /Guardar pronóstico/ }))

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        match_id: '10',
        predicted_home_score: 1,
        predicted_away_score: 0,
        predicted_advancing_team_id: undefined,
      }),
    )
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: '¡Pronóstico guardado!' }),
    )
    expect((await screen.findByText(/Tu pronóstico/)).textContent).toContain(
      '1 – 0',
    )
  })

  it('shows a red toast and keeps the editor open on error', async () => {
    const user = userEvent.setup()
    mutateAsync.mockRejectedValueOnce(new Error('boom'))
    renderCard({})

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByRole('button', { name: /Guardar pronóstico/ }))

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'destructive' }),
      ),
    )
    expect(
      screen.getByRole('button', { name: /Guardar pronóstico/ }),
    ).toBeInTheDocument()
  })

  it('renders read-only with no controls when locked', () => {
    renderCard({
      match: makeMatch({ status: 'finished', homeScore: 2, awayScore: 1 }),
      prediction: makePrediction(),
    })
    expect(screen.getByText(/Tu pronóstico/)).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows "Sin pronóstico" when locked without a prediction', () => {
    renderCard({ match: makeMatch({ status: 'finished' }) })
    expect(screen.getByText('Sin pronóstico')).toBeInTheDocument()
  })

  it('requires an advancing team for knockout matches', async () => {
    const user = userEvent.setup()
    mutateAsync.mockResolvedValueOnce(
      makePrediction({ predictedAdvancingTeamId: '1' }),
    )
    renderCard({ match: makeMatch({ phase: 'round_of_32' }) })

    await user.click(screen.getByRole('button'))
    expect(
      screen.getByRole('radiogroup', { name: '¿Quién pasa de ronda?' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Guardar pronóstico/ }),
    ).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: /URU/ }))
    await user.click(screen.getByRole('button', { name: /Guardar pronóstico/ }))

    await waitFor(() =>
      expect(mutateAsync.mock.calls.at(-1)?.[0]).toMatchObject({
        predicted_advancing_team_id: '1',
      }),
    )
  })

  it('opens a bottom sheet on mobile', async () => {
    const user = userEvent.setup()
    useMediaQueryMock.mockReturnValue(false)
    renderCard({})

    await user.click(screen.getByRole('button'))

    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByRole('button', { name: /Guardar pronóstico/ }),
    ).toBeInTheDocument()
  })

  describe('finished result tint', () => {
    // Result 3–0 (home win); the prediction varies the outcome category.
    function renderFinished(prediction: Prediction) {
      return renderCard({
        match: makeMatch({
          status: 'finished',
          kickoffAt: '2020-01-01T00:00:00Z',
          homeScore: 3,
          awayScore: 0,
        }),
        prediction,
      })
    }

    it('tints amber when the winner is right but the score and diff are not', () => {
      // Predicted 1–0: correct winner (home), wrong score, wrong goal diff →
      // "partial" → amber, like the home result card.
      const { container } = renderFinished(
        makePrediction({ predictedHomeScore: 1, predictedAwayScore: 0 }),
      )
      expect(container.firstElementChild?.className).toContain('FFFBEB')
    })

    it('tints green for an exact hit and red for a wrong outcome', () => {
      const exact = renderFinished(
        makePrediction({ predictedHomeScore: 3, predictedAwayScore: 0 }),
      )
      expect(exact.container.firstElementChild?.className).toContain('F0FDF4')

      const wrong = renderFinished(
        makePrediction({ predictedHomeScore: 0, predictedAwayScore: 2 }),
      )
      expect(wrong.container.firstElementChild?.className).toContain('FEF2F2')
    })
  })
})
