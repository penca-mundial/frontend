import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResultCard } from '@/features/home/components/ResultCard'
import type { Match } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'

function prediction(home: number, away: number, points?: number): Prediction {
  return {
    id: 'p1',
    matchId: '10',
    predictedHomeScore: home,
    predictedAwayScore: away,
    predictedAdvancingTeamId: null,
    lockedAt: null,
    locked: true,
    points,
  }
}

// Finished 2 – 1 (home win).
function finished(myPrediction: Prediction | null): Match {
  return {
    id: '10',
    externalId: null,
    tournamentId: '1',
    kickoffAt: '2026-06-12T19:00:00Z',
    status: 'finished',
    phase: 'group_stage',
    group: 'A',
    minute: null,
    homeScore: 2,
    awayScore: 1,
    advancingTeamId: null,
    homeTeam: { id: '1', name: 'Uruguay', code3: 'URU', flagUrl: null },
    awayTeam: { id: '2', name: 'Argentina', code3: 'ARG', flagUrl: null },
    myPrediction,
  }
}

function sectionClass(): string {
  return document.querySelector('section')?.className ?? ''
}

describe('ResultCard', () => {
  it('colors the card green and shows the eyebrow + neutral points chip on an exact hit', () => {
    render(<ResultCard match={finished(prediction(2, 1, 8))} showEyebrow timezone="UTC" />)

    expect(sectionClass()).toContain('from-success-soft')
    expect(screen.getByText('Último resultado')).toBeInTheDocument()
    expect(screen.getByText('+8 pts')).toBeInTheDocument()
    expect(screen.getByText('2 – 1')).toBeInTheDocument() // the prediction
  })

  it('colors the card yellow for a correct winner that is not exact', () => {
    // Predicted 3–1 (home win), result 2–1 (home win) → partial.
    render(<ResultCard match={finished(prediction(3, 1, 3))} timezone="UTC" />)
    expect(sectionClass()).toContain('from-warning-soft')
    // Not the first card: no eyebrow.
    expect(screen.queryByText('Último resultado')).not.toBeInTheDocument()
  })

  it('colors the card red for a wrong outcome', () => {
    render(<ResultCard match={finished(prediction(0, 2, 0))} timezone="UTC" />)
    expect(sectionClass()).toContain('from-danger-soft')
    expect(screen.getByText('+0 pts')).toBeInTheDocument()
  })

  it('is neutral with no points chip and no prediction when the user did not predict', () => {
    render(<ResultCard match={finished(null)} showEyebrow timezone="UTC" />)
    expect(sectionClass()).toContain('bg-surface')
    expect(screen.queryByText(/pts/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Pronosticaste/)).not.toBeInTheDocument()
  })

  it('degrades to no points chip when points have not been scored yet', () => {
    render(<ResultCard match={finished(prediction(2, 1))} timezone="UTC" />)
    // Still shows the result + prediction, just no number.
    expect(screen.getByText('Uruguay')).toBeInTheDocument()
    expect(screen.getByText(/Pronosticaste/)).toBeInTheDocument()
    expect(screen.queryByText(/pts/)).not.toBeInTheDocument()
  })

  it('uses a custom prediction label when given (other user profiles)', () => {
    render(
      <ResultCard
        match={finished(prediction(2, 1, 8))}
        predictionLabel="Pronóstico"
        timezone="UTC"
      />,
    )
    expect(screen.getByText(/Pronóstico/)).toBeInTheDocument()
    expect(screen.queryByText(/Pronosticaste/)).not.toBeInTheDocument()
  })

  it('shows the green "Avance" chip on a knockout result where the advancing pick landed', () => {
    const pred: Prediction = {
      ...prediction(2, 1, 8),
      predictedAdvancingTeamId: '1', // picked Uruguay
    }
    const ko: Match = {
      ...finished(pred),
      phase: 'round_of_32',
      group: null,
      advancingTeamId: '1', // Uruguay actually advanced
    }
    render(<ResultCard match={ko} timezone="UTC" />)

    const chip = screen.getByText(/Avance Uruguay/)
    expect(chip).toBeInTheDocument()
    expect(chip.className).toMatch(/success-soft/)
  })

  it('badges a live match and stays neutral (no outcome colour for a non-final score)', () => {
    const live: Match = { ...finished(prediction(1, 0, 3)), status: 'live', minute: 67 }
    render(<ResultCard match={live} timezone="UTC" />)

    expect(screen.getByText(/En vivo/i)).toBeInTheDocument()
    // Not coloured by outcome — the match has not finished.
    expect(sectionClass()).toContain('bg-surface')
    expect(sectionClass()).not.toContain('from-success-soft')
  })
})
