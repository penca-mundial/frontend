import { useMemo, useState } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { MatchCardExpandable } from '@/components/matches/MatchCardExpandable'
import { BracketView } from '@/components/matches/BracketView'
import type { Match, MatchPhase } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'
import {
  buildBracketRounds,
  isKnockoutPhase,
  KNOCKOUT_ROUND_ORDER,
  PHASE_LABELS,
} from '@/features/matches/utils'
import { cn } from '@/lib/cn'

type SubPhaseFilter = MatchPhase | 'all'

export interface EliminationViewProps {
  /** All fixtures; knockout matches are selected internally. */
  matches: Match[]
  /** User predictions keyed by match id, for inline prediction in list view. */
  predictions: Map<string, Prediction>
  timezone: string
  /** Invoked when a bracket match is tapped (e.g. navigate to its detail). */
  onSelectMatch?: (match: Match) => void
}

/**
 * Knockout view with two interchangeable presentations of the same matches:
 * a flat, sub-phase-filterable list (default, inline-predictable via
 * `MatchCardExpandable`) and the read-only `BracketView`. Owns its own view
 * mode and sub-phase filter — the parent only supplies data.
 */
export function EliminationView({
  matches,
  predictions,
  timezone,
  onSelectMatch,
}: EliminationViewProps) {
  const [view, setView] = useState<'list' | 'bracket'>('list')
  const [subPhase, setSubPhase] = useState<SubPhaseFilter>('all')

  const knockoutMatches = useMemo(
    () => matches.filter((match) => isKnockoutPhase(match.phase)),
    [matches],
  )

  const presentPhases = useMemo(() => {
    const present = new Set(knockoutMatches.map((match) => match.phase))
    return KNOCKOUT_ROUND_ORDER.filter((phase) => present.has(phase))
  }, [knockoutMatches])

  const listMatches = useMemo(() => {
    const sorted = [...knockoutMatches].sort(
      (a, b) =>
        new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime(),
    )
    return subPhase === 'all'
      ? sorted
      : sorted.filter((match) => match.phase === subPhase)
  }, [knockoutMatches, subPhase])

  const rounds = useMemo(
    () => buildBracketRounds(knockoutMatches),
    [knockoutMatches],
  )

  if (knockoutMatches.length === 0) {
    return (
      <p className="text-text-secondary text-body-sm py-8 text-center">
        Las eliminatorias se publicarán cuando se confirmen los cruces.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        {view === 'list' ? (
          <div
            role="group"
            aria-label="Filtrar por fase"
            className="bg-surface-muted inline-flex w-fit max-w-full gap-1 overflow-x-auto rounded-lg p-1"
          >
            {(['all', ...presentPhases] as SubPhaseFilter[]).map((phase) => {
              const selected = subPhase === phase
              return (
                <button
                  key={phase}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSubPhase(phase)}
                  className={cn(
                    'shrink-0 rounded-md px-3 py-1.5 text-body-sm font-medium whitespace-nowrap transition-colors',
                    selected
                      ? 'bg-surface text-text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary',
                  )}
                >
                  {phase === 'all' ? 'Todas' : PHASE_LABELS[phase]}
                </button>
              )
            })}
          </div>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={() => setView((v) => (v === 'list' ? 'bracket' : 'list'))}
          className="border-border text-text-secondary hover:text-text-primary inline-flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-body-sm font-medium transition-colors"
        >
          {view === 'list' ? (
            <>
              <LayoutGrid size={15} aria-hidden="true" />
              Ver cuadro
            </>
          ) : (
            <>
              <List size={15} aria-hidden="true" />
              Ver lista
            </>
          )}
        </button>
      </div>

      {view === 'list' ? (
        listMatches.length === 0 ? (
          <p className="text-text-secondary text-body">
            No hay partidos para esta fase.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {listMatches.map((match) => (
              <MatchCardExpandable
                key={match.id}
                match={match}
                prediction={predictions.get(match.id) ?? null}
                timezone={timezone}
              />
            ))}
          </div>
        )
      ) : (
        <BracketView rounds={rounds} onSelectMatch={onSelectMatch} />
      )}
    </div>
  )
}
