import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProfileStatsBlock } from '@/features/users/components/ProfileStatsBlock'

describe('ProfileStatsBlock', () => {
  it('renders the five accuracy buckets with their labels', () => {
    render(
      <ProfileStatsBlock
        stats={{
          exact: 4,
          correctWinner: 3,
          goalDifference: 2,
          missed: 5,
          total: 14,
        }}
      />,
    )

    for (const label of [
      'Exactos',
      'Ganador',
      'Diferencia',
      'Errados',
      'Total',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
    expect(screen.getByText('14')).toBeInTheDocument()
  })
})
