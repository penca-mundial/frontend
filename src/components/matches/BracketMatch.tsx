import { CheckIcon, XIcon } from 'lucide-react'
import type { Match, MatchTeam } from '@/features/matches/types'
import { advancingPredictionOutcome } from '@/features/matches/utils'
import { cn } from '@/lib/cn'

export interface BracketMatchProps {
  match: Match
  /** Optional: tapping a match can lead elsewhere (e.g. the list to predict). */
  onSelect?: (match: Match) => void
}

const TEAM_TBD = 'Por definir'

function TeamRow({
  team,
  score,
  isWinner,
}: {
  team: MatchTeam | null
  score: number | null
  isWinner: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 px-2 py-1',
        isWinner ? 'text-text-primary font-semibold' : 'text-text-secondary',
      )}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        {team?.flagUrl ? (
          <img
            src={team.flagUrl}
            alt=""
            className="size-4 shrink-0 rounded-sm object-cover"
          />
        ) : null}
        <span className="truncate text-body-sm">{team?.name ?? TEAM_TBD}</span>
      </span>
      {score !== null ? (
        <span className="text-mono-mini tabular-nums">{score}</span>
      ) : null}
    </div>
  )
}

/**
 * A single read-only match cell in the knockout bracket. Shows both teams (or
 * "Por definir" when an upstream round hasn't finished), the real score once
 * finished, the winner emphasised, and a subtle indicator of whether the user
 * predicted the advancing team correctly. Predicting is not possible here (v2);
 * tapping can optionally route to the list.
 */
export function BracketMatch({ match, onSelect }: BracketMatchProps) {
  const finished = match.status === 'finished'
  const outcome = advancingPredictionOutcome(match)
  const interactive = Boolean(onSelect)

  const content = (
    <>
      <TeamRow
        team={match.homeTeam}
        score={finished ? match.homeScore : null}
        isWinner={
          match.advancingTeamId !== null &&
          match.advancingTeamId === match.homeTeam?.id
        }
      />
      <div className="border-border border-t" />
      <TeamRow
        team={match.awayTeam}
        score={finished ? match.awayScore : null}
        isWinner={
          match.advancingTeamId !== null &&
          match.advancingTeamId === match.awayTeam?.id
        }
      />
      {outcome && (
        <span
          className={cn(
            'absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full text-white',
            outcome === 'correct' ? 'bg-success' : 'bg-danger',
          )}
          aria-label={
            outcome === 'correct'
              ? 'Acertaste el pronóstico'
              : 'No acertaste el pronóstico'
          }
        >
          {outcome === 'correct' ? (
            <CheckIcon className="size-3" />
          ) : (
            <XIcon className="size-3" />
          )}
        </span>
      )}
    </>
  )

  const className = cn(
    'bg-surface border-border relative flex w-44 flex-col rounded-md border shadow-sm',
  )

  if (interactive) {
    return (
      <button
        type="button"
        onClick={() => onSelect?.(match)}
        className={cn(
          className,
          'focus-visible:ring-ring text-left transition-colors hover:border-border-strong focus-visible:ring-2 focus-visible:outline-none',
        )}
      >
        {content}
      </button>
    )
  }

  return <div className={className}>{content}</div>
}
