import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  KnockoutBracket,
  type BracketRound,
} from '@/components/matches/KnockoutBracket'

const URU = { code3: 'URU', name: 'Uruguay', flag: '' }
const ARG = { code3: 'ARG', name: 'Argentina', flag: '' }

function roundWith(matches: BracketRound['matches']): BracketRound[] {
  return [{ key: 'r16', label: 'Octavos', short: '8vos', matches }]
}

describe('KnockoutBracket — scores', () => {
  it('renders a real score strongly and a predicted score with the "Pronóstico" tag', () => {
    render(
      <KnockoutBracket
        rounds={roundWith([
          {
            id: 'real',
            home: { ...URU, score: 2 },
            away: { ...ARG, score: 1 },
            kickoff: '2026-07-04T18:00:00Z',
            scoreKind: 'real',
          },
          {
            id: 'pred',
            home: { ...URU, score: 3 },
            away: { ...ARG, score: 0 },
            kickoff: '2026-07-05T18:00:00Z',
            scoreKind: 'predicted',
          },
        ])}
      />,
    )

    // Real scores render; the predicted card carries the "Pronóstico" tag (only one).
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getAllByText('Pronóstico')).toHaveLength(1)
  })

  it('falls back to the code3 when there is no score', () => {
    render(
      <KnockoutBracket
        rounds={roundWith([
          {
            id: 'open',
            home: URU,
            away: ARG,
            kickoff: '2026-07-04T18:00:00Z',
          },
        ])}
      />,
    )
    expect(screen.getByText('URU')).toBeInTheDocument()
    expect(screen.queryByText('Pronóstico')).not.toBeInTheDocument()
  })
})

describe('KnockoutBracket — predict button', () => {
  const predictableRounds = roundWith([
    {
      id: 'm1',
      home: URU,
      away: ARG,
      kickoff: '2099-07-04T18:00:00Z',
      predictable: true,
    },
  ])

  it('shows "Predecir" only once the predictable node is focused, and calls onPredict', () => {
    const onPredict = vi.fn()
    render(<KnockoutBracket rounds={predictableRounds} onPredict={onPredict} />)

    // Hidden until focused.
    expect(
      screen.queryByRole('button', { name: /Predecir/ }),
    ).not.toBeInTheDocument()

    // Focus the node (the card button shows the team name).
    fireEvent.click(screen.getByText('Uruguay'))

    const predictBtn = screen.getByRole('button', { name: /Predecir/ })
    fireEvent.click(predictBtn)
    expect(onPredict).toHaveBeenCalledWith('m1')
  })

  it('never shows "Predecir" on a non-predictable node, even focused', () => {
    render(
      <KnockoutBracket
        rounds={roundWith([
          {
            id: 'locked',
            home: URU,
            away: ARG,
            kickoff: '2026-07-04T18:00:00Z',
            predictable: false,
          },
        ])}
        onPredict={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByText('Uruguay'))
    expect(
      screen.queryByRole('button', { name: /Predecir/ }),
    ).not.toBeInTheDocument()
  })

  it('never shows "Predecir" without an onPredict handler', () => {
    render(<KnockoutBracket rounds={predictableRounds} />)
    fireEvent.click(screen.getByText('Uruguay'))
    expect(
      screen.queryByRole('button', { name: /Predecir/ }),
    ).not.toBeInTheDocument()
  })

  it('makes the third-place card selectable and predictable', () => {
    const onPredict = vi.fn()
    render(
      <KnockoutBracket
        rounds={roundWith([
          { id: 'final1', home: URU, away: ARG, kickoff: '2099-07-19T18:00:00Z' },
        ])}
        thirdPlace={{
          id: 'tp',
          home: URU,
          away: ARG,
          kickoff: '2099-07-18T18:00:00Z',
          predictable: true,
        }}
        onPredict={onPredict}
      />,
    )
    // Hidden until the 3rd-place card is selected.
    expect(
      screen.queryByRole('button', { name: /Predecir/ }),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('3er puesto'))
    fireEvent.click(screen.getByRole('button', { name: /Predecir/ }))
    expect(onPredict).toHaveBeenCalledWith('tp')
  })

  it('opens the anchored popover with renderPredict on desktop', () => {
    render(
      <KnockoutBracket
        rounds={predictableRounds}
        renderPredict={(matchId, close) => (
          <button type="button" onClick={close}>
            editor for {matchId}
          </button>
        )}
      />,
    )
    fireEvent.click(screen.getByText('Uruguay'))
    fireEvent.click(screen.getByRole('button', { name: /Predecir/ }))
    expect(screen.getByText(/editor for m1/)).toBeInTheDocument()
  })
})
