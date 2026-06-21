import type { BracketMatch, MatchTeam } from '@/features/matches/types'
import { bracketAdvanceOutcome, type AdvanceOutcome } from '@/features/matches/bracket'
import { LIVE_MATCH_CARD_BORDER } from '@/features/matches/utils'
import { formatKickoff } from '@/lib/date'
import { detectUserTimezone } from '@/lib/timezone'
import { cn } from '@/lib/cn'

const TEAM_TBD = 'Por definir'

/** "EN VIVO · 67'" pill (compact). */
function LiveTag({ minute }: { minute: number | null }) {
  return (
    <span className="text-live inline-flex items-center gap-1 text-[10px] font-semibold uppercase">
      <span className="bg-live size-1.5 animate-pulse rounded-full" aria-hidden="true" />
      Vivo{minute != null ? ` ${minute}'` : ''}
    </span>
  )
}

interface TeamRowProps {
  team: MatchTeam | null
  score: number | null
  showScore: boolean
  isAdvancing: boolean
  isMyPick: boolean
  /** When the match is finished, the outcome of MY advance pick on this row. */
  pickOutcome: AdvanceOutcome
}

/**
 * One team line: flag + name + (live/finished) score. The team that actually
 * advanced is emphasised. My advance pick is marked — neutral before kick-off,
 * tinted green/red once the match is finished (acerté / erré el avance).
 */
function TeamRow({
  team,
  score,
  showScore,
  isAdvancing,
  isMyPick,
  pickOutcome,
}: TeamRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 rounded-[5px] border-l-2 border-transparent px-1.5 py-1',
        // My pick, pre-game: subtle teal accent. Finished: green/red tint.
        isMyPick && pickOutcome === null && 'border-brand-primary',
        pickOutcome === 'correct' && 'bg-success-soft border-success',
        pickOutcome === 'incorrect' && 'bg-danger-soft border-danger',
        isAdvancing
          ? 'text-text-primary font-semibold'
          : 'text-text-secondary',
      )}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        {team?.flagUrl ? (
          <img
            src={team.flagUrl}
            alt=""
            className="size-4 shrink-0 rounded-[2px] object-cover shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
          />
        ) : (
          <span
            className="bg-surface-muted size-4 shrink-0 rounded-[2px]"
            aria-hidden="true"
          />
        )}
        <span className="truncate text-body-sm">{team?.name ?? TEAM_TBD}</span>
      </span>
      {showScore && score !== null && (
        <span className="text-body-sm font-semibold tabular-nums">{score}</span>
      )}
    </div>
  )
}

export interface BracketMatchCardProps {
  match: BracketMatch
}

/**
 * A read-only knockout cruce in the bracket: kick-off eyebrow (+ live tag),
 * then both team rows with the score (live and finished, not only finished),
 * the advancer emphasised, and the viewer's gated advance pick signalled
 * (neutral pre-game → green/red once played). No predicting from here.
 */
export function BracketMatchCard({ match }: BracketMatchCardProps) {
  const tz = detectUserTimezone()
  const outcome = bracketAdvanceOutcome(match)
  const myPick = match.myPrediction?.predictedAdvancingTeamId ?? null
  const isLive = match.status === 'live'
  const showScore = isLive || match.status === 'finished'

  const row = (team: MatchTeam | null, score: number | null) => {
    const isMyPick = myPick !== null && team !== null && team.id === myPick
    return (
      <TeamRow
        team={team}
        score={score}
        showScore={showScore}
        isAdvancing={
          match.advancingTeamId !== null && team?.id === match.advancingTeamId
        }
        isMyPick={isMyPick}
        pickOutcome={isMyPick ? outcome : null}
      />
    )
  }

  return (
    <div
      className={cn(
        'bg-surface border-border w-44 rounded-lg border p-1.5 shadow-sm',
        isLive && LIVE_MATCH_CARD_BORDER,
      )}
    >
      <div className="text-text-secondary flex items-center justify-between gap-2 px-1.5 pb-1 text-[10px] font-semibold tracking-wide uppercase">
        <span>{formatKickoff(match.kickoffAt, 'date', tz)}</span>
        {isLive && <LiveTag minute={match.minute} />}
      </div>
      <div className="flex flex-col gap-0.5">
        {row(match.homeTeam, match.homeScore)}
        {row(match.awayTeam, match.awayScore)}
      </div>
    </div>
  )
}
