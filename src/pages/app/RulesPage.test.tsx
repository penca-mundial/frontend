import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RulesPage } from '@/pages/app/RulesPage'
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

describe('RulesPage', () => {
  it('renders the heading and the scoring tables from the config', () => {
    mock({ data: CONFIG })
    render(<RulesPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'Reglas' })).toBeInTheDocument()
    expect(screen.getByText('Resultado exacto')).toBeInTheDocument()
    expect(screen.getByText('Campeón acertado')).toBeInTheDocument()
    expect(screen.getByText('×4')).toBeInTheDocument()
  })

  it('shows a skeleton while loading', () => {
    mock({ isLoading: true })
    const { container } = render(<RulesPage />)
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull()
  })

  it('shows an error message on failure', () => {
    mock({ isError: true })
    render(<RulesPage />)
    expect(screen.getByText(/No pudimos cargar las reglas/i)).toBeInTheDocument()
  })
})
