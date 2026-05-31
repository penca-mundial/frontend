import { BracketMatch } from '@/components/matches/BracketMatch'
import type { BracketRound, Match } from '@/features/matches/types'
import { getPhaseLabel } from '@/features/matches/utils'

export interface BracketViewProps {
  /** Ordered knockout rounds (see `buildBracketRounds`). */
  rounds: BracketRound[]
  onSelectMatch?: (match: Match) => void
}

/**
 * Read-only knockout bracket. On desktop the rounds sit side by side as columns
 * (Dieciseisavos → … → Final) with connector lines between them; on mobile each
 * phase fills the viewport and the user swipes horizontally between them
 * (scroll-snap). Pure presentation — it renders the structured `rounds` it is
 * given and holds no fetching or scoring logic.
 */
export function BracketView({ rounds, onSelectMatch }: BracketViewProps) {
  if (rounds.length === 0) {
    return (
      <p className="text-text-secondary text-body-sm py-8 text-center">
        El cuadro de eliminación todavía no está disponible.
      </p>
    )
  }

  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:snap-none md:justify-start md:overflow-visible">
      {rounds.map((round) => (
        <section
          key={round.phase}
          aria-label={getPhaseLabel(round.phase)}
          className="flex min-w-full shrink-0 snap-center flex-col gap-3 md:min-w-0 md:flex-1"
        >
          <h3 className="text-text-secondary text-mono-mini text-center font-semibold tracking-wide uppercase">
            {getPhaseLabel(round.phase)}
          </h3>
          <div className="flex flex-1 flex-col items-center justify-around gap-3">
            {round.matches.map((match) => (
              <div key={match.id} className="relative md:after:absolute md:after:top-1/2 md:after:left-full md:after:h-px md:after:w-4 md:after:bg-border md:last:after:hidden">
                <BracketMatch match={match} onSelect={onSelectMatch} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
