import * as React from 'react'
import { Check, Target, X } from 'lucide-react'
import { PredictionEditor } from '@/components/matches/PredictionEditor'
import { PredictionSheet } from '@/components/matches/PredictionSheet'
import { getApiError } from '@/api/auth.api'
import { useUpsertPrediction } from '@/features/matches/hooks/useUpsertPrediction'
import type { Match, MatchTeam } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'
import { getPhaseLabel, isMatchLocked } from '@/features/matches/utils'
import {
  predictionResultStatus,
  type PredictionResultStatus,
} from '@/features/predictions/utils'
import { formatKickoff } from '@/lib/date'
import { detectUserTimezone } from '@/lib/timezone'
import { cn } from '@/lib/cn'
import { toast } from '@/hooks/useToast'
import { useMediaQuery } from '@/hooks/useMediaQuery'

export interface MatchCardExpandableProps {
  match: Match
  /** The user's prediction for this match, joined by the parent list. */
  prediction?: Prediction | null
  timezone?: string
  /**
   * Force the static, non-editable rendering (no expansion, no "Predecir"),
   * regardless of lock state — used by history views like "Mis pronósticos".
   */
  readOnly?: boolean
  /**
   * Show the kickoff date next to the time in the eyebrow. Off by default —
   * day-grouped lists (Calendario, Mis pronósticos) already have a day header,
   * so it's only needed where matches aren't grouped by day (the Grupos tab).
   */
  showDate?: boolean
}

function teamName(team: MatchTeam | null): string {
  return team?.name ?? 'Por definir'
}

function TeamFlag({ team }: { team: MatchTeam | null }) {
  if (team?.flagUrl) {
    return (
      <span className="inline-flex h-[26px] w-[36px] shrink-0 overflow-hidden rounded-[3px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]">
        <img src={team.flagUrl} alt="" className="block size-full object-cover" />
      </span>
    )
  }
  return (
    <span className="bg-surface-muted text-text-secondary inline-flex h-[26px] w-[36px] shrink-0 items-center justify-center rounded-[3px] text-[10px]">
      {team?.code3 ?? '—'}
    </span>
  )
}

// Status metadata: kept deliberately small so it never out-shouts the teams.
function StatusBadge({ match }: { match: Match }) {
  if (match.status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[11px] font-semibold text-[#991B1B]">
        <span className="bg-live size-1.5 animate-pulse rounded-full" />
        EN VIVO{match.minute != null ? ` · ${match.minute}'` : ''}
      </span>
    )
  }
  if (match.status === 'finished') {
    return (
      <span className="bg-success-soft rounded-full px-2 py-0.5 text-[11px] font-semibold text-[#166534]">
        FINAL
      </span>
    )
  }
  // Scheduled: the kickoff time already shows next to the phase — no duplicate.
  return null
}

const CHIP_CLASS: Record<PredictionResultStatus, string> = {
  exact: 'bg-success-soft text-[#166534]',
  partial: 'bg-warning-soft text-[#854D0E]',
  wrong: 'bg-danger-soft text-[#991B1B]',
  pending: 'bg-surface-muted text-text-secondary',
}

function PredictionChip({
  prediction,
  match,
}: {
  prediction: Prediction
  match: Match
}) {
  const status = predictionResultStatus(prediction, match)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap',
        CHIP_CLASS[status],
      )}
    >
      {status === 'exact' && <Check size={11} strokeWidth={2.5} />}
      {status === 'wrong' && <X size={11} strokeWidth={2.5} />}
      Tu pronóstico {prediction.predictedHomeScore} –{' '}
      {prediction.predictedAwayScore}
    </span>
  )
}

/**
 * A team's name + flag, pinned to the outer edge of the card with the flag
 * toward the centre (home: "Name 🇲🇽", away: "🇿🇦 Name"). The score lives in the
 * centre cluster, not here — matching the fixture reference.
 */
function TeamSide({
  team,
  side,
}: {
  team: MatchTeam | null
  side: 'home' | 'away'
}) {
  const isHome = side === 'home'
  const name = (
    <span className="truncate text-base font-semibold md:text-lg">
      {teamName(team)}
    </span>
  )
  return (
    <div
      className={cn(
        'flex w-full min-w-0 items-center gap-2.5',
        // Hug the centre (toward the score), leaving the outer space empty so
        // names aren't pushed to the card edges.
        isHome ? 'justify-end' : 'justify-start',
      )}
    >
      {isHome ? (
        <>
          {name}
          <TeamFlag team={team} />
        </>
      ) : (
        <>
          <TeamFlag team={team} />
          {name}
        </>
      )}
    </div>
  )
}

function Score({ value }: { value: number | null }) {
  return (
    <span className="font-display text-text-primary min-w-[2ch] text-center text-2xl leading-none font-bold tabular-nums md:text-3xl">
      {value}
    </span>
  )
}

/** The visual face of the card (header + teams + footer), shared by the
 *  collapsed button and the expanded container. */
function CardFace({
  match,
  prediction,
  timezone,
  locked,
  showDate,
}: {
  match: Match
  prediction: Prediction | null
  timezone: string
  locked: boolean
  showDate: boolean
}) {
  const hasScore = match.status === 'live' || match.status === 'finished'
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-text-secondary text-[11px] font-semibold tracking-wide uppercase">
            {match.group
              ? `Grupo ${match.group}`
              : match.phase
                ? getPhaseLabel(match.phase)
                : 'Fase de grupos'}
          </span>
          <span className="text-border-strong text-[11px]">·</span>
          {showDate && (
            <>
              <span className="text-text-secondary text-[11px] font-medium">
                {formatKickoff(match.kickoffAt, 'date', timezone)}
              </span>
              <span className="text-border-strong text-[11px]">·</span>
            </>
          )}
          <span className="text-text-secondary text-[11px] font-medium tabular-nums">
            {formatKickoff(match.kickoffAt, 'time', timezone)}
          </span>
        </div>
        <StatusBadge match={match} />
      </div>

      {/* Symmetric 1fr_auto_1fr grid: equal side columns keep the centre
          column dead-centre, so "vs" is always at the exact card centre. Scores
          reserve 2-digit width and sit symmetrically around "vs". */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-4 sm:gap-x-6">
        <TeamSide team={match.homeTeam} side="home" />
        <div className="flex shrink-0 items-center justify-center gap-2.5 sm:gap-3">
          {hasScore && match.homeScore !== null && (
            <Score value={match.homeScore} />
          )}
          <span className="text-text-disabled text-xs">vs</span>
          {hasScore && match.awayScore !== null && (
            <Score value={match.awayScore} />
          )}
        </div>
        <TeamSide team={match.awayTeam} side="away" />
      </div>

      <div className="border-border flex items-center justify-between gap-2 border-t border-dashed pt-1.5">
        {prediction ? (
          <PredictionChip prediction={prediction} match={match} />
        ) : (
          <span className="text-text-secondary text-xs">
            {locked ? 'Sin pronóstico' : 'Sin pronóstico todavía'}
          </span>
        )}
        {!prediction && !locked && (
          <span className="bg-brand-primary-soft text-brand-primary-hover inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold">
            <Target size={11} strokeWidth={2} />
            Predecir
          </span>
        )}
        {prediction && match.status === 'live' && (
          <span className="bg-warning-soft rounded-full px-2 py-0.5 text-[11px] font-semibold text-[#854D0E]">
            A definir
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * Match card that lets a user predict without navigating. Collapsed it shows
 * the phase, kickoff, teams and either their prediction or a "Predecir" pill;
 * clicking expands the editor inline on desktop (≥768px) and opens a bottom
 * sheet on mobile. Locked/finished matches render read-only. Captures input
 * only and sends it to the predictions API — no scoring logic, never navigates.
 */
export function MatchCardExpandable({
  match,
  prediction: predictionProp = null,
  timezone = detectUserTimezone(),
  readOnly = false,
  showDate = false,
}: MatchCardExpandableProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const upsert = useUpsertPrediction(match.id)

  const [prediction, setPrediction] = React.useState<Prediction | null>(
    predictionProp,
  )
  const [expanded, setExpanded] = React.useState(false)

  // Keep in sync when the parent list refetches (e.g. after invalidation).
  React.useEffect(() => {
    setPrediction(predictionProp)
  }, [predictionProp])

  const locked = readOnly || isMatchLocked({ ...match, myPrediction: prediction })

  const handleSave = async (input: {
    home: number
    away: number
    advancing?: string | null
  }) => {
    try {
      const saved = await upsert.mutateAsync({
        match_id: match.id,
        predicted_home_score: input.home,
        predicted_away_score: input.away,
        predicted_advancing_team_id: input.advancing,
      })
      setPrediction(saved)
      setExpanded(false)
      toast({ title: '¡Pronóstico guardado!' })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo guardar el pronóstico',
        description: getApiError(error)?.message ?? 'Intentá de nuevo.',
      })
      // Swallow: the editor stays open (we don't collapse) so the user can retry.
    }
  }

  const isLive = match.status === 'live'
  const isFinished = match.status === 'finished'
  const resultStatus = prediction
    ? predictionResultStatus(prediction, match)
    : 'pending'

  const cardClasses = cn(
    'w-full rounded-xl border p-3 shadow-sm text-left transition-colors',
    // Subtle result tint once finished: green for an exact hit, red for a miss.
    isFinished && resultStatus === 'exact'
      ? 'bg-[linear-gradient(180deg,#F0FDF4_0%,#FFFFFF_60%)]'
      : isFinished && resultStatus === 'wrong'
        ? 'bg-[linear-gradient(180deg,#FEF2F2_0%,#FFFFFF_60%)]'
        : 'bg-surface',
    // Live matches get a red border + glow; expanded desktop cards a brand edge.
    isLive
      ? 'border-live/45 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]'
      : expanded && isDesktop
        ? 'border-brand-primary/50'
        : 'border-border',
  )

  const face = (
    <CardFace
      match={match}
      prediction={prediction}
      timezone={timezone}
      locked={locked}
      showDate={showDate}
    />
  )

  // Locked: read-only, not interactive.
  if (locked) {
    return <div className={cardClasses}>{face}</div>
  }

  // Desktop expanded: inline editor below the (non-button) face.
  if (isDesktop && expanded) {
    return (
      <div className={cardClasses}>
        {face}
        <div className="border-border mt-3 border-t pt-3">
          <PredictionEditor
            match={match}
            initial={prediction}
            onSave={handleSave}
            onCancel={() => setExpanded(false)}
            variant="inline"
          />
        </div>
      </div>
    )
  }

  // Collapsed (and mobile): the whole card is a button that opens the editor.
  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className={cn(
          cardClasses,
          'transition-all duration-150 ease-out hover:-translate-y-px hover:shadow-md',
          'focus-visible:outline-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2',
        )}
      >
        {face}
      </button>
      {!isDesktop && (
        <PredictionSheet
          match={match}
          initial={prediction}
          open={expanded}
          onOpenChange={setExpanded}
          onSave={handleSave}
        />
      )}
    </>
  )
}
