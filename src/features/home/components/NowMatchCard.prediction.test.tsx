import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NowMatchCard } from '@/features/home/components/NowMatchCard'
import type { Match } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'

// Renders the REAL MatchCardExpandable (unlike NowMatchCard.test, which stubs
// it) to prove the "Próximo partido" card surfaces my_prediction end-to-end —
// the bug where it showed "Sin pronóstico todavía" despite an existing pick.
vi.mock('@/features/home/hooks/useNowMatch', () => ({ useNowMatch: vi.fn() }))
vi.mock('@/hooks/useMediaQuery', () => ({ useMediaQuery: vi.fn(() => true) }))
vi.mock('@/features/matches/hooks/useUpsertPrediction', () => ({
  useUpsertPrediction: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}))
vi.mock('@/hooks/useToast', () => ({ toast: vi.fn() }))

import { useNowMatch } from '@/features/home/hooks/useNowMatch'

const useNowMatchMock = vi.mocked(useNowMatch)

function scheduledMatch(myPrediction: Prediction | null): Match {
  return {
    id: '10',
    externalId: null,
    tournamentId: '1',
    kickoffAt: '2099-06-12T19:00:00Z', // far future → not locked
    status: 'scheduled',
    phase: 'group_stage',
    group: 'A',
    minute: null,
    homeScore: null,
    awayScore: null,
    advancingTeamId: null,
    homeTeam: { id: '1', name: 'Uruguay', code3: 'URU', flagUrl: null },
    awayTeam: { id: '2', name: 'Argentina', code3: 'ARG', flagUrl: null },
    myPrediction,
  }
}

// Compact shape mirrors the /matches/next user_scoreboard payload (predicted
// scores + points; no id/locked) — the card only needs the scores.
const prediction: Prediction = {
  id: 'p1',
  matchId: '10',
  predictedHomeScore: 2,
  predictedAwayScore: 0,
  predictedAdvancingTeamId: null,
  lockedAt: null,
  locked: false,
}

beforeEach(() => vi.clearAllMocks())

describe('NowMatchCard — Próximo partido prediction', () => {
  it('renders the existing prediction (Fixture style) when my_prediction is present', () => {
    useNowMatchMock.mockReturnValue({
      liveMatches: [],
      nextMatch: scheduledMatch(prediction),
      isLoading: false,
    })

    render(<NowMatchCard />)

    expect(
      screen.getByRole('heading', { name: 'Próximo partido' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Tu pronóstico/).textContent).toContain('2 – 0')
    expect(screen.queryByText('Sin pronóstico todavía')).not.toBeInTheDocument()
  })

  it('shows "Sin pronóstico todavía" + Predecir when there is no prediction', () => {
    useNowMatchMock.mockReturnValue({
      liveMatches: [],
      nextMatch: scheduledMatch(null),
      isLoading: false,
    })

    render(<NowMatchCard />)

    expect(screen.getByText('Sin pronóstico todavía')).toBeInTheDocument()
    expect(screen.getByText('Predecir')).toBeInTheDocument()
  })
})
