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
}

function teamName(team: MatchTeam | null): string {
  return team?.name ?? 'Por definir'
}

function TeamFlag({ team }: { team: MatchTeam | null }) {
  if (team?.flagUrl) {
    return (
      <span className="inline-flex h-[18px] w-[26px] shrink-0 overflow-hidden rounded-[3px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]">
        <img src={team.flagUrl} alt="" className="block size-full object-cover" />
      </span>
    )
  }
  return (
    <span className="bg-surface-muted text-text-secondary text-mono-mini inline-flex h-[18px] w-[26px] shrink-0 items-center justify-center rounded-[3px]">
      {team?.code3 ?? '—'}
    </span>
  )
}

function StatusBadge({ match, timezone }: { match: Match; timezone: string }) {
  if (match.status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEE2E2] px-2.5 py-1 text-mono-mini font-semibold text-[#991B1B]">
        <span className="bg-live size-1.5 animate-pulse rounded-full" />
        EN VIVO
      </span>
    )
  }
  if (match.status === 'finished') {
    return (
      <span className="bg-success-soft rounded-full px-2.5 py-1 text-mono-mini font-semibold text-[#166534]">
        FINAL
      </span>
    )
  }
  return (
    <span className="bg-surface-muted text-text-secondary rounded-full px-2.5 py-1 text-mono-mini font-semibold">
      {formatKickoff(match.kickoffAt, 'time', timezone).replace(':', 'h')}
    </span>
  )
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
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-mono-mini font-semibold whitespace-nowrap',
        CHIP_CLASS[status],
      )}
    >
      {status === 'exact' && <Check size={11} strokeWidth={2.5} />}
      {status === 'wrong' && <X size={11} strokeWidth={2.5} />}
      Tu pronóstico {prediction.predictedHomeScore}-
      {prediction.predictedAwayScore}
    </span>
  )
}

function TeamLine({
  team,
  align,
  score,
}: {
  team: MatchTeam | null
  align: 'left' | 'right'
  score: number | null
}) {
  const isRight = align === 'right'
  return (
    <div className={cn('flex items-center gap-2', isRight && 'flex-row-reverse')}>
      <TeamFlag team={team} />
      <div className={cn('min-w-0 flex-1', isRight ? 'text-right' : 'text-left')}>
        <div className="text-body-sm truncate font-semibold leading-tight">
          {teamName(team)}
        </div>
        {score !== null && (
          <div className="font-display text-text-primary mt-0.5 text-[22px] leading-none font-bold tabular-nums">
            {score}
          </div>
        )}
      </div>
    </div>
  )
}

/** The visual face of the card (header + teams + footer), shared by the
 *  collapsed button and the expanded container. */
function CardFace({
  match,
  prediction,
  timezone,
  locked,
}: {
  match: Match
  prediction: Prediction | null
  timezone: string
  locked: boolean
}) {
  const hasScore = match.status === 'live' || match.status === 'finished'
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-text-secondary text-mono-mini font-semibold uppercase">
            {getPhaseLabel(match.phase)}
          </span>
          <span className="text-border-strong">·</span>
          <span className="text-text-secondary text-mono-mini font-medium">
            {formatKickoff(match.kickoffAt, 'time', timezone)}
          </span>
        </div>
        <StatusBadge match={match} timezone={timezone} />
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5">
        <TeamLine
          team={match.homeTeam}
          align="left"
          score={hasScore ? match.homeScore : null}
        />
        <span className="text-text-disabled text-mono-mini">vs</span>
        <TeamLine
          team={match.awayTeam}
          align="right"
          score={hasScore ? match.awayScore : null}
        />
      </div>

      <div className="border-border flex items-center justify-between gap-2 border-t border-dashed pt-2">
        {prediction ? (
          <PredictionChip prediction={prediction} match={match} />
        ) : (
          <span className="text-text-secondary text-body-sm">
            {locked ? 'Sin pronóstico' : 'Sin pronóstico todavía'}
          </span>
        )}
        {!prediction && !locked && (
          <span className="bg-brand-primary-soft text-brand-primary-hover inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-mono-mini font-semibold">
            <Target size={11} strokeWidth={2} />
            Predecir
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

  const locked = isMatchLocked({ ...match, myPrediction: prediction })

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

  const cardClasses = cn(
    'w-full rounded-xl border bg-surface p-3.5 shadow-sm text-left',
    expanded && isDesktop ? 'border-brand-primary/50' : 'border-border',
  )

  const face = (
    <CardFace
      match={match}
      prediction={prediction}
      timezone={timezone}
      locked={locked}
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
