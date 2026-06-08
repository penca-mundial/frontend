import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ScoringRulesTable } from '@/features/landing/components/ScoringRulesTable'
import type { ScoringConfig } from '@/features/scoring/types'

vi.mock('@/features/scoring/hooks/useScoringConfig', () => ({
  useScoringConfig: vi.fn(),
}))

import { useScoringConfig } from '@/features/scoring/hooks/useScoringConfig'

const useScoringConfigMock = vi.mocked(useScoringConfig)

const CONFIG: ScoringConfig = {
  scoringRules: [
    { ruleType: 'exact_score', points: 10, label: 'Resultado exacto' },
    { ruleType: 'champion_correct', points: 50, label: 'Campeón acertado' },
  ],
  phaseMultipliers: [{ phase: 'final', multiplier: 4, label: 'Final' }],
}

function mock(state: {
  data?: ScoringConfig
  isLoading?: boolean
  isError?: boolean
}) {
  useScoringConfigMock.mockReturnValue({
    data: state.data,
    isLoading: state.isLoading ?? false,
    isError: state.isError ?? false,
  } as unknown as ReturnType<typeof useScoringConfig>)
}

beforeEach(() => vi.clearAllMocks())

describe('ScoringRulesTable (landing)', () => {
  it('renders the scoring values from the endpoint, not hardcoded copy', () => {
    mock({ data: CONFIG })
    render(<ScoringRulesTable />)

    expect(screen.getByText('Resultado exacto')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    // The special, previously absent from the landing, now shows with points.
    expect(screen.getByText('Campeón acertado')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('×4')).toBeInTheDocument()
  })

  it('keeps the section heading', () => {
    mock({ data: CONFIG })
    render(<ScoringRulesTable />)
    expect(
      screen.getByRole('heading', { name: /Cómo se reparten los puntos/i }),
    ).toBeInTheDocument()
  })

  it('renders nothing breaking while loading (skeleton, no crash)', () => {
    mock({ isLoading: true })
    const { container } = render(<ScoringRulesTable />)
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull()
  })

  it('hides the tables on error without throwing', () => {
    mock({ isError: true })
    render(<ScoringRulesTable />)
    expect(screen.queryByText('Resultado exacto')).not.toBeInTheDocument()
  })
})
