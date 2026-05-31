import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { EliminationView } from '@/components/matches/EliminationView'
import type { Match, MatchPhase } from '@/features/matches/types'

const URU = { id: '1', name: 'Uruguay', code3: 'URU', flagUrl: null }
const ARG = { id: '2', name: 'Argentina', code3: 'ARG', flagUrl: null }
const BRA = { id: '3', name: 'Brasil', code3: 'BRA', flagUrl: null }
const FRA = { id: '4', name: 'Francia', code3: 'FRA', flagUrl: null }

function makeMatch(id: string, phase: MatchPhase, overrides: Partial<Match> = {}): Match {
  return {
    id,
    externalId: null,
    tournamentId: '1',
    kickoffAt: '2026-07-01T18:00:00Z',
    status: 'scheduled',
    phase,
    group: null,
    minute: null,
    homeScore: null,
    awayScore: null,
    advancingTeamId: null,
    homeTeam: URU,
    awayTeam: ARG,
    myPrediction: null,
    ...overrides,
  }
}

function renderView(matches: Match[]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <EliminationView
          matches={matches}
          predictions={new Map()}
          timezone="UTC"
        />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('EliminationView', () => {
  it('shows the empty state when there are no knockout matches', () => {
    renderView([makeMatch('g1', 'group_stage')])
    expect(
      screen.getByText(/Las eliminatorias se publicarán/i),
    ).toBeInTheDocument()
  })

  it('lists knockout matches by default and toggles to the bracket', async () => {
    const user = userEvent.setup()
    renderView([makeMatch('r16', 'round_of_16')])

    // List view by default: the match's teams are shown.
    expect(screen.getByText('Uruguay')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Ver cuadro/ }))

    // Bracket view: the filter is gone and the round title shows.
    expect(
      screen.getByRole('button', { name: /Ver lista/ }),
    ).toBeInTheDocument()
    expect(screen.getByText('Octavos')).toBeInTheDocument()
  })

  it('filters the list by sub-phase', async () => {
    const user = userEvent.setup()
    renderView([
      makeMatch('r16', 'round_of_16'),
      makeMatch('qf', 'quarter_final', { homeTeam: BRA, awayTeam: FRA }),
    ])
    expect(screen.getByText('Uruguay')).toBeInTheDocument()
    expect(screen.getByText('Brasil')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cuartos' }))

    expect(screen.queryByText('Uruguay')).not.toBeInTheDocument()
    expect(screen.getByText('Brasil')).toBeInTheDocument()
  })
})
