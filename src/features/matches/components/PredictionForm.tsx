import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PredictionStepper } from '@/components/matches/PredictionStepper'
import { getApiError } from '@/api/auth.api'
import { useUpsertPrediction } from '@/features/matches/hooks/useUpsertPrediction'
import {
  predictionSchema,
  type PredictionValues,
} from '@/features/matches/schemas'
import type { Match, MatchTeam } from '@/features/matches/types'
import { isKnockoutPhase } from '@/features/matches/utils'
import { toast } from '@/hooks/useToast'
import { cn } from '@/lib/cn'

export interface PredictionFormProps {
  match: Match
}

function teamName(team: MatchTeam | null): string {
  return team?.name ?? 'Por definir'
}

/**
 * Prediction form for an open match. Validates scores (0–20 integers) and, for
 * knockout matches, requires picking the advancing team — same rules as the
 * backend, enforced client-side via Zod. Submitting upserts the prediction and
 * invalidates the relevant queries so the UI updates.
 */
export function PredictionForm({ match }: PredictionFormProps) {
  const knockout = isKnockoutPhase(match.phase)
  const upsert = useUpsertPrediction(match.id)
  const prediction = match.myPrediction

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PredictionValues>({
    resolver: zodResolver(predictionSchema(knockout)),
    defaultValues: {
      homeScore: prediction?.predictedHomeScore ?? 0,
      awayScore: prediction?.predictedAwayScore ?? 0,
      advancingTeamId: prediction?.predictedAdvancingTeamId ?? null,
    },
  })

  const onSubmit = (values: PredictionValues) => {
    upsert.mutate(
      {
        match_id: match.id,
        predicted_home_score: values.homeScore,
        predicted_away_score: values.awayScore,
        predicted_advancing_team_id: knockout
          ? values.advancingTeamId
          : undefined,
      },
      {
        onSuccess: () => toast({ title: '¡Pronóstico guardado!' }),
        onError: (error) =>
          toast({
            variant: 'destructive',
            title: 'No se pudo guardar el pronóstico',
            description: getApiError(error)?.message ?? 'Intentá de nuevo.',
          }),
      },
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Pronóstico"
      className="flex flex-col gap-6"
    >
      <div className="flex items-start justify-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <span className="text-body-sm text-text-secondary text-center">
            {teamName(match.homeTeam)}
          </span>
          <Controller
            control={control}
            name="homeScore"
            render={({ field }) => (
              <PredictionStepper
                label={teamName(match.homeTeam)}
                value={field.value}
                onChange={field.onChange}
                disabled={upsert.isPending}
              />
            )}
          />
        </div>
        <span className="text-text-disabled self-center text-body-sm">vs</span>
        <div className="flex flex-col items-center gap-2">
          <span className="text-body-sm text-text-secondary text-center">
            {teamName(match.awayTeam)}
          </span>
          <Controller
            control={control}
            name="awayScore"
            render={({ field }) => (
              <PredictionStepper
                label={teamName(match.awayTeam)}
                value={field.value}
                onChange={field.onChange}
                disabled={upsert.isPending}
              />
            )}
          />
        </div>
      </div>

      {knockout && (
        <Controller
          control={control}
          name="advancingTeamId"
          render={({ field }) => (
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
                  const selected = team !== null && field.value === team.id
                  return (
                    <button
                      key={team?.id ?? index}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={team === null || upsert.isPending}
                      onClick={() => team && field.onChange(team.id)}
                      className={cn(
                        'min-h-9 rounded-sm px-3 text-body-sm font-medium transition-colors disabled:opacity-50',
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
        />
      )}

      {errors.advancingTeamId && (
        <p
          role="alert"
          className="text-danger inline-flex items-center justify-center gap-1.5 text-body-sm"
        >
          <AlertCircle size={14} aria-hidden="true" />
          {errors.advancingTeamId.message}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={upsert.isPending}
      >
        {upsert.isPending ? 'Guardando…' : 'Guardar pronóstico'}
      </Button>
    </form>
  )
}
