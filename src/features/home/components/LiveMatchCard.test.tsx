import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LiveMatchCard } from '@/features/home/components/LiveMatchCard'
import type { Match } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'

// Real teams carry flag images, so the imageless code3 fallback never shows.
const ENG = { id: '1', name: 'Inglaterra', code3: 'ENG', flagUrl: 'https://flags/eng.png' }
const CRO = { id: '2', name: 'Croacia', code3: 'CRO', flagUrl: 'https://flags/cro.png' }

function liveMatch(myPrediction: Prediction | null = null): Match {
  return {
    id: '10',
    externalId: null,
    tournamentId: '1',
    kickoffAt: '2026-06-12T17:00:00Z',
    status: 'live',
    phase: 'group_stage',
    group: 'H',
    minute: 67,
    homeScore: 1,
    awayScore: 0,
    advancingTeamId: null,
    homeTeam: ENG,
    awayTeam: CRO,
    myPrediction,
  }
}

describe('LiveMatchCard', () => {
  it('renders the mock layout: teams (no codes), scores, group/time, live badge', () => {
    render(<LiveMatchCard match={liveMatch()} timezone="UTC" />)

    expect(screen.getByText('Inglaterra')).toBeInTheDocument()
    expect(screen.getByText('Croacia')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText("EN VIVO · 67'")).toBeInTheDocument()
    expect(screen.getByText('Grupo H')).toBeInTheDocument()
    expect(screen.getByText('17:00')).toBeInTheDocument()

    // No country-code labels and no venue line, per the mock.
    expect(screen.queryByText('ENG')).not.toBeInTheDocument()
    expect(screen.queryByText('CRO')).not.toBeInTheDocument()
    expect(screen.queryByText(/Stadium|Miami/)).not.toBeInTheDocument()
    // No "Ver detalle" affordance.
    expect(screen.queryByText(/Ver detalle/)).not.toBeInTheDocument()
  })

  it('shows "Pronosticaste X – Y" when the match carries the user prediction', () => {
    const prediction: Prediction = {
      id: 'p1',
      matchId: '10',
      predictedHomeScore: 2,
      predictedAwayScore: 1,
      predictedAdvancingTeamId: null,
      lockedAt: null,
      locked: true,
    }
    render(<LiveMatchCard match={liveMatch(prediction)} timezone="UTC" />)

    expect(screen.getByText(/Pronosticaste/)).toBeInTheDocument()
    expect(screen.getByText("2 – 1")).toBeInTheDocument()
    // No projection until projected_points rides the payload.
    expect(screen.queryByText(/pts/)).not.toBeInTheDocument()
  })

  it('appends the "Si termina así, +Z pts" projection from my_prediction.points', () => {
    const prediction: Prediction = {
      id: 'p1',
      matchId: '10',
      predictedHomeScore: 2,
      predictedAwayScore: 1,
      predictedAdvancingTeamId: null,
      lockedAt: null,
      locked: true,
      points: 6,
    }
    render(<LiveMatchCard match={liveMatch(prediction)} timezone="UTC" />)

    expect(screen.getByText(/Pronosticaste/)).toBeInTheDocument()
    expect(screen.getByText('2 – 1')).toBeInTheDocument()
    expect(screen.getByText(/Si termina así/)).toBeInTheDocument()
    expect(screen.getByText('+6 pts')).toBeInTheDocument()
  })

  it('shows the projection even when the points are 0 (regression: 0 is not falsy-hidden)', () => {
    const prediction: Prediction = {
      id: 'p1',
      matchId: '10',
      predictedHomeScore: 1,
      predictedAwayScore: 0,
      predictedAdvancingTeamId: null,
      lockedAt: null,
      locked: true,
      points: 0,
    }
    render(<LiveMatchCard match={liveMatch(prediction)} timezone="UTC" />)

    expect(screen.getByText(/Si termina así/)).toBeInTheDocument()
    expect(screen.getByText('+0 pts')).toBeInTheDocument()
  })

  it('omits the prediction pill when the match has no embedded prediction', () => {
    render(<LiveMatchCard match={liveMatch(null)} timezone="UTC" />)
    expect(screen.queryByText(/Pronosticaste/)).not.toBeInTheDocument()
  })

  it('shows the pending "Tu pick" advance chip for a live knockout match', () => {
    const prediction: Prediction = {
      id: 'p1',
      matchId: '10',
      predictedHomeScore: 2,
      predictedAwayScore: 1,
      predictedAdvancingTeamId: '1', // Inglaterra
      lockedAt: null,
      locked: true,
    }
    const ko: Match = { ...liveMatch(prediction), phase: 'round_of_32', group: null }
    render(<LiveMatchCard match={ko} timezone="UTC" />)

    expect(screen.getByText(/Tu pick: Inglaterra pasa/)).toBeInTheDocument()
  })

  it('does not show the advance chip on a live group-stage match', () => {
    const prediction: Prediction = {
      id: 'p1',
      matchId: '10',
      predictedHomeScore: 2,
      predictedAwayScore: 1,
      predictedAdvancingTeamId: null,
      lockedAt: null,
      locked: true,
    }
    render(<LiveMatchCard match={liveMatch(prediction)} timezone="UTC" />)
    expect(screen.queryByText(/Tu pick/)).not.toBeInTheDocument()
  })
})
