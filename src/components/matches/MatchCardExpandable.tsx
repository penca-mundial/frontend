import * as React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PredictionSheet } from '@/components/matches/PredictionSheet'
import { PredictionStepper } from '@/components/matches/PredictionStepper'
import { getApiError } from '@/api/auth.api'
import { predictionsApi } from '@/api/predictions.api'
import type { Match, MatchTeam } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'
import {
  getPhaseLabel,
  isKnockoutPhase,
  isMatchLocked,
} from '@/features/matches/utils'
import { formatMatchDate } from '@/lib/date'
import { detectUserTimezone } from '@/lib/timezone'
import { cn } from '@/lib/cn'
import { toast } from '@/hooks/useToast'
import { useMediaQuery } from '@/hooks/useMediaQuery'

export interface MatchCardExpandableProps {
  match: Match
  /** IANA timezone for kickoff display; defaults to the browser's. */
  timezone?: string
}

const TEAM_TBD = 'Por definir'

function teamName(team: MatchTeam | null): string {
  return team?.name ?? TEAM_TBD
}

function TeamFlag({ team }: { team: MatchTeam | null }) {
  if (team?.flagUrl) {
    return (
      <img
        src={team.flagUrl}
        alt=""
        className="size-5 shrink-0 rounded-sm object-cover"
      />
    )
  }
  return (
    <span className="text-text-secondary text-mono-mini shrink-0">
      {team?.code3 ?? '—'}
    </span>
  )
}

/**
 * Match card that lets a user predict without navigating. Collapsed it shows
 * the phase, kickoff, teams and either their prediction or a "Predecir" button.
 * Predicting expands inline on desktop (≥768px) and opens a bottom sheet on
 * mobile. Captures input only and sends it to the predictions API client — no
 * scoring logic, never navigates.
 */
export function MatchCardExpandable({
  match,
  timezone = detectUserTimezone(),
}: MatchCardExpandableProps) {
  const queryClient = useQueryClient()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const [prediction, setPrediction] = React.useState<Prediction | null>(
    match.myPrediction ?? null,
  )
  const [expanded, setExpanded] = React.useState(false)

  const knockout = isKnockoutPhase(match.phase)
  const locked = isMatchLocked({ ...match, myPrediction: prediction })

  const [home, setHome] = React.useState(prediction?.predictedHomeScore ?? 0)
  const [away, setAway] = React.useState(prediction?.predictedAwayScore ?? 0)
  const [advancing, setAdvancing] = React.useState<string | null>(
    prediction?.predictedAdvancingTeamId ?? null,
  )

  // Reset the draft to the saved prediction (or zero) whenever the editor opens.
  const openEditor = () => {
    setHome(prediction?.predictedHomeScore ?? 0)
    setAway(prediction?.predictedAwayScore ?? 0)
    setAdvancing(prediction?.predictedAdvancingTeamId ?? null)
    setExpanded(true)
  }

  const mutation = useMutation({
    mutationFn: () =>
      predictionsApi.upsert({
        match_id: match.id,
        predicted_home_score: home,
        predicted_away_score: away,
        predicted_advancing_team_id: knockout ? advancing : undefined,
      }),
    onSuccess: (saved) => {
      setPrediction(saved)
      setExpanded(false)
      toast({ title: '¡Pronóstico guardado!' })
      void queryClient.invalidateQueries({ queryKey: ['matches'] })
      void queryClient.invalidateQueries({ queryKey: ['predictions'] })
      void queryClient.invalidateQueries({ queryKey: ['match', match.id] })
    },
    onError: (error) => {
      // Keep the editor open so the user can retry.
      toast({
        variant: 'destructive',
        title: 'No se pudo guardar el pronóstico',
        description: getApiError(error)?.message ?? 'Intentá de nuevo.',
      })
    },
  })

  const canSubmit = !mutation.isPending && (!knockout || advancing !== null)

  const editorBody = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-4">
        <div className="flex flex-1 flex-col items-center gap-2">
          <span className="text-body-sm text-text-secondary text-center">
            {teamName(match.homeTeam)}
          </span>
          <PredictionStepper
            label={teamName(match.homeTeam)}
            value={home}
            onChange={setHome}
            disabled={mutation.isPending}
          />
        </div>
        <span className="text-text-disabled text-body-sm">vs</span>
        <div className="flex flex-1 flex-col items-center gap-2">
          <span className="text-body-sm text-text-secondary text-center">
            {teamName(match.awayTeam)}
          </span>
          <PredictionStepper
            label={teamName(match.awayTeam)}
            value={away}
            onChange={setAway}
            disabled={mutation.isPending}
          />
        </div>
      </div>

      {knockout && (
        <fieldset className="flex flex-col items-center gap-2">
          <legend className="text-body-sm text-text-secondary mb-1">
            ¿Quién pasa de ronda?
          </legend>
          <div
            role="radiogroup"
            aria-label="¿Quién pasa de ronda?"
            className="inline-flex rounded-md border border-border p-0.5"
          >
            {[match.homeTeam, match.awayTeam].map((team, index) => {
              const selected = team !== null && advancing === team.id
              return (
                <button
                  key={team?.id ?? index}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={team === null || mutation.isPending}
                  onClick={() => team && setAdvancing(team.id)}
                  className={cn(
                    'min-h-9 rounded-sm px-3 text-body-sm font-medium transition-colors',
                    'disabled:opacity-50',
                    selected
                      ? 'bg-brand-primary text-white'
                      : 'text-text-secondary hover:bg-surface-muted',
                  )}
                >
                  {teamName(team)}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}
    </div>
  )

  const editorFooter = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setExpanded(false)}
        disabled={mutation.isPending}
      >
        Cancelar
      </Button>
      <Button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={!canSubmit}
      >
        {mutation.isPending ? 'Guardando…' : 'Guardar'}
      </Button>
    </>
  )

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center gap-3 p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{getPhaseLabel(match.phase)}</Badge>
            {match.status === 'live' ? (
              <span className="text-live text-mono-mini font-semibold">
                EN VIVO
              </span>
            ) : (
              <span className="text-text-secondary text-body-sm">
                {formatMatchDate(match.kickoffAt, timezone)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <TeamFlag team={match.homeTeam} />
            <span className="text-body truncate font-medium">
              {teamName(match.homeTeam)}
            </span>
            <span className="text-text-disabled text-body-sm px-1">vs</span>
            <TeamFlag team={match.awayTeam} />
            <span className="text-body truncate font-medium">
              {teamName(match.awayTeam)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          {prediction ? (
            <span className="text-text-secondary text-body-sm">
              Tu pronóstico{' '}
              <span className="text-text-primary text-mono-mini font-semibold">
                {prediction.predictedHomeScore}-
                {prediction.predictedAwayScore}
              </span>
            </span>
          ) : locked ? (
            <span className="text-text-disabled text-body-sm">
              Sin pronóstico
            </span>
          ) : null}

          {!locked &&
            (isDesktop ? !expanded : true) && (
              <Button type="button" size="sm" onClick={openEditor}>
                {prediction ? 'Editar' : 'Predecir'}
              </Button>
            )}
        </div>
      </div>

      {/* Desktop: inline expansion with a 200ms entry animation. */}
      {isDesktop && expanded && (
        <div className="animate-in fade-in slide-in-from-top-1 border-border border-t px-4 py-4 duration-200">
          {editorBody}
          <div className="mt-4 flex justify-end gap-2">{editorFooter}</div>
        </div>
      )}

      {/* Mobile: bottom sheet. */}
      {!isDesktop && (
        <PredictionSheet
          open={expanded}
          onOpenChange={setExpanded}
          title={`${teamName(match.homeTeam)} vs ${teamName(match.awayTeam)}`}
          description={getPhaseLabel(match.phase)}
          footer={<div className="flex w-full gap-2 [&>*]:flex-1">{editorFooter}</div>}
        >
          {editorBody}
        </PredictionSheet>
      )}
    </Card>
  )
}
