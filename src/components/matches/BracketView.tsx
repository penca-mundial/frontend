import { BracketMatchCard } from '@/components/matches/BracketMatchCard'
import { SectionLabel } from '@/components/ui/section-label'
import type { BracketMatch } from '@/features/matches/types'
import { buildBracketTree, type BracketColumn } from '@/features/matches/bracket'
import { getPhaseLabel } from '@/features/matches/utils'

/** Split a round's matches into adjacent feeder pairs (2k / 2k+1). */
function pairUp(matches: BracketMatch[]): BracketMatch[][] {
  const pairs: BracketMatch[][] = []
  for (let i = 0; i < matches.length; i += 2) {
    pairs.push(matches.slice(i, i + 2))
  }
  return pairs
}

function RoundHeading({ phase }: { phase: BracketColumn['phase'] }) {
  return (
    <SectionLabel as="h3" tone="secondary" className="text-center">
      {getPhaseLabel(phase)}
    </SectionLabel>
  )
}

/**
 * One desktop pair: the two feeder cards stacked, with the data-driven connector
 * (two stubs + a vertical join + the stub into the next round). A lone card
 * (odd round, partial data) renders without the join.
 */
function ConnectedPair({ pair }: { pair: BracketMatch[] }) {
  return (
    <div className="relative flex flex-col justify-around gap-8">
      {pair.map((match) => (
        <div key={match.id} className="relative">
          <BracketMatchCard match={match} />
          <span
            aria-hidden="true"
            className="bg-border absolute top-1/2 left-full h-px w-5"
          />
        </div>
      ))}
      {pair.length === 2 && (
        <>
          {/* vertical join between the two feeders' stubs */}
          <span
            aria-hidden="true"
            className="bg-border absolute top-1/4 bottom-1/4 left-[calc(100%+1.25rem)] w-px"
          />
          {/* stub from the join into the next round's card */}
          <span
            aria-hidden="true"
            className="bg-border absolute top-1/2 left-[calc(100%+1.25rem)] h-px w-5"
          />
        </>
      )}
    </div>
  )
}

function DesktopColumn({
  column,
  isLast,
}: {
  column: BracketColumn
  isLast: boolean
}) {
  return (
    <div className="flex flex-col gap-3">
      <RoundHeading phase={column.phase} />
      <div className="flex flex-1 flex-col justify-around gap-8">
        {isLast
          ? column.matches.map((match) => (
              <BracketMatchCard key={match.id} match={match} />
            ))
          : pairUp(column.matches).map((pair) => (
              <ConnectedPair key={pair[0].id} pair={pair} />
            ))}
      </div>
    </div>
  )
}

function MobileColumn({ column }: { column: BracketColumn }) {
  return (
    <section
      aria-label={getPhaseLabel(column.phase)}
      className="flex min-w-full shrink-0 snap-center flex-col gap-3"
    >
      <RoundHeading phase={column.phase} />
      <div className="flex flex-col items-center gap-3">
        {column.matches.map((match) => (
          <BracketMatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  )
}

/** Third place sits outside the tree (a consolation match, not a bracket node). */
function ThirdPlace({ match }: { match: BracketMatch }) {
  return (
    <div className="border-border flex flex-col items-center gap-3 border-t border-dashed pt-4">
      <SectionLabel as="h3" tone="secondary">
        Tercer puesto
      </SectionLabel>
      <BracketMatchCard match={match} />
    </div>
  )
}

function EmptyState() {
  return (
    <p className="text-text-secondary text-body-sm py-8 text-center">
      Las eliminatorias se publican cuando se confirmen los cruces.
    </p>
  )
}

export interface BracketViewProps {
  /** Knockout matches from `GET /tournaments/:id/bracket` (topology + pick). */
  matches: BracketMatch[]
}

/**
 * Read-only knockout bracket, data-driven from the dedicated endpoint. The tree
 * is built from the real topology (`feedsIntoMatchId` / `bracketPosition`): on
 * desktop the rounds are columns with connectors joining each feeder pair to its
 * next-round cruce; on mobile each round is a full-width panel the user swipes
 * (scroll-snap). Third place is shown apart. Only existing rounds render
 * (create-on-resolve) — nothing yet → empty-state.
 */
export function BracketView({ matches }: BracketViewProps) {
  const { columns, thirdPlace } = buildBracketTree(matches)

  if (columns.length === 0 && thirdPlace === null) {
    return <EmptyState />
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Mobile: one round per swipeable panel. */}
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:hidden">
        {columns.map((column) => (
          <MobileColumn key={column.phase} column={column} />
        ))}
      </div>

      {/* Desktop: the connected tree (horizontal scroll if it overflows). */}
      <div className="hidden gap-10 overflow-x-auto pb-2 md:flex">
        {columns.map((column, index) => (
          <DesktopColumn
            key={column.phase}
            column={column}
            isLast={index === columns.length - 1}
          />
        ))}
      </div>

      {thirdPlace && <ThirdPlace match={thirdPlace} />}
    </div>
  )
}
