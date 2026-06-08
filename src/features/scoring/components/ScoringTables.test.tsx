import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ScoringTables } from '@/features/scoring/components/ScoringTables'
import type { ScoringConfig } from '@/features/scoring/types'

const CONFIG: ScoringConfig = {
  scoringRules: [
    { ruleType: 'exact_score', points: 10, label: 'Resultado exacto' },
    { ruleType: 'correct_winner', points: 3, label: 'Resultado acertado' },
    { ruleType: 'champion_correct', points: 50, label: 'Campeón acertado' },
    { ruleType: 'runner_up_correct', points: 30, label: 'Subcampeón acertado' },
    { ruleType: 'top_scorer_correct', points: 25, label: 'Goleador acertado' },
  ],
  phaseMultipliers: [
    { phase: 'group_stage', multiplier: 1, label: 'Fase de grupos' },
    { phase: 'round_of_32', multiplier: 1.5, label: 'Dieciseisavos de final' },
    { phase: 'final', multiplier: 4, label: 'Final' },
  ],
}

describe('ScoringTables', () => {
  it('renders every rule label and points from the config (no hardcoded copy)', () => {
    render(<ScoringTables config={CONFIG} />)

    for (const rule of CONFIG.scoringRules) {
      expect(screen.getByText(rule.label)).toBeInTheDocument()
    }
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
  })

  it('splits per-match rules from the tournament specials', () => {
    render(<ScoringTables config={CONFIG} />)

    const matchTable = screen.getByRole('table', { name: /partido/i })
    const specialTable = screen.getByRole('table', { name: /torneo/i })

    // Per-match rules live in the match table, specials in the other.
    expect(within(matchTable).getByText('Resultado exacto')).toBeInTheDocument()
    expect(
      within(matchTable).queryByText('Campeón acertado'),
    ).not.toBeInTheDocument()
    expect(within(specialTable).getByText('Campeón acertado')).toBeInTheDocument()
    expect(within(specialTable).getByText('Goleador acertado')).toBeInTheDocument()
    expect(
      within(specialTable).queryByText('Resultado exacto'),
    ).not.toBeInTheDocument()
  })

  it('formats phase multipliers as ×N, dropping a trailing .0', () => {
    render(<ScoringTables config={CONFIG} />)

    const phaseTable = screen.getByRole('table', { name: /fase/i })
    expect(within(phaseTable).getByText('×1')).toBeInTheDocument()
    expect(within(phaseTable).getByText('×1.5')).toBeInTheDocument()
    expect(within(phaseTable).getByText('×4')).toBeInTheDocument()
    expect(within(phaseTable).getByText('Final')).toBeInTheDocument()
  })
})
