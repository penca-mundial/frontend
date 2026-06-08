import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EvolutionChart } from '@/features/rankings/components/EvolutionChart'
import type { EvolutionLine } from '@/api/rankings.api'

const LINES: EvolutionLine[] = [
  {
    userId: '1',
    username: 'leo',
    avatarUrl: null,
    series: [
      { date: '2026-06-12', points: 10, rank: 1 },
      { date: '2026-06-13', points: 20, rank: 1 },
    ],
  },
  {
    userId: '9',
    username: 'santi',
    avatarUrl: null,
    series: [
      { date: '2026-06-12', points: 4, rank: 2 },
      { date: '2026-06-13', points: 8, rank: 2 },
    ],
  },
]

/** Parse a polyline's "x,y x,y" attribute into [{x,y}]. */
function points(el: Element): { x: number; y: number }[] {
  return (el.getAttribute('points') ?? '')
    .trim()
    .split(/\s+/)
    .map((pair) => {
      const [x, y] = pair.split(',').map(Number)
      return { x, y }
    })
}

function renderChart(metric: 'points' | 'rank') {
  return render(
    <EvolutionChart
      lines={LINES}
      metric={metric}
      currentUserId="9"
      width={600}
      height={300}
    />,
  )
}

describe('EvolutionChart', () => {
  it('draws one line per series and lists every username in the legend', () => {
    renderChart('points')

    expect(screen.getAllByTestId('evolution-line')).toHaveLength(2)
    const legend = screen.getByTestId('evolution-legend')
    expect(within(legend).getByText('leo')).toBeInTheDocument()
    expect(within(legend).getByText('santi')).toBeInTheDocument()
  })

  it("flags the current user's line so it can be highlighted", () => {
    renderChart('points')
    const mine = screen
      .getAllByTestId('evolution-line')
      .find((el) => el.getAttribute('data-user') === '9')
    expect(mine).toHaveAttribute('data-current', 'true')
    // Highlighted = thicker stroke than the others.
    const others = screen
      .getAllByTestId('evolution-line')
      .filter((el) => el.getAttribute('data-user') !== '9')
    const myWidth = Number(mine!.getAttribute('stroke-width'))
    for (const o of others) {
      expect(myWidth).toBeGreaterThan(Number(o.getAttribute('stroke-width')))
    }
  })

  it('points mode: more points sit higher (smaller y)', () => {
    renderChart('points')
    const leo = screen
      .getAllByTestId('evolution-line')
      .find((el) => el.getAttribute('data-user') === '1')!
    const santi = screen
      .getAllByTestId('evolution-line')
      .find((el) => el.getAttribute('data-user') === '9')!
    // leo (20 pts) ends above santi (8 pts) on the last date.
    expect(points(leo).at(-1)!.y).toBeLessThan(points(santi).at(-1)!.y)
    // And each line climbs as points grow: later point higher than earlier.
    expect(points(leo)[1].y).toBeLessThan(points(leo)[0].y)
  })

  it('rank mode: axis is inverted so 1º sits at the top (smaller y)', () => {
    renderChart('rank')
    const leo = screen
      .getAllByTestId('evolution-line')
      .find((el) => el.getAttribute('data-user') === '1')! // rank 1
    const santi = screen
      .getAllByTestId('evolution-line')
      .find((el) => el.getAttribute('data-user') === '9')! // rank 2
    // Rank 1 is drawn above rank 2.
    expect(points(leo)[0].y).toBeLessThan(points(santi)[0].y)
  })

  it('labels the x-axis from the calendar date, with no timezone shift', () => {
    // The series date is a plain UTC snapshot day; it must render verbatim
    // (12/6, 13/6) regardless of the viewer's timezone — not shifted a day.
    renderChart('points')
    expect(screen.getByText('12/6')).toBeInTheDocument()
    expect(screen.getByText('13/6')).toBeInTheDocument()
  })

  it('rank mode: y-axis ticks are whole positions', () => {
    renderChart('rank')
    const ticks = screen
      .getAllByTestId('evolution-ytick')
      .map((el) => el.textContent)
    expect(ticks).toContain('1')
    expect(ticks).toContain('2')
    // No fractional ranks.
    expect(ticks.every((t) => /^\d+º?$/.test(t ?? ''))).toBe(true)
  })
})
