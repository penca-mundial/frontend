import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getApiError } from '@/api/auth.api'
import type { MatchTeam } from '@/features/matches/types'
import type {
  Player,
  TournamentPrediction,
} from '@/features/tournament-predictions/types'
import {
  tournamentPredictionSchema,
  type TournamentPredictionValues,
} from '@/features/tournament-predictions/schemas'
import {
  PodiumPicker,
  type PodiumSpot,
} from '@/features/tournament-predictions/components/PodiumPicker'
import { TopScorerPicker } from '@/features/tournament-predictions/components/TopScorerPicker'
import type { UpsertTournamentPredictionPayload } from '@/types/api'
import { toast } from '@/hooks/useToast'

export interface TournamentPredictionFormProps {
  teams: MatchTeam[]
  players: Player[]
  /** Existing prediction to prefill, or null for an empty form. */
  initial: TournamentPrediction | null
  /** Persists the (flat) payload; rejects with the axios error on 422. */
  onSubmit: (payload: UpsertTournamentPredictionPayload) => Promise<void>
}

function initialValues(
  initial: TournamentPrediction | null,
): TournamentPredictionValues {
  return {
    championId: initial?.championId ?? null,
    runnerUpId: initial?.runnerUpId ?? null,
    thirdPlaceId: initial?.thirdPlaceId ?? null,
    fourthPlaceId: initial?.fourthPlaceId ?? null,
    topScorerId: initial?.topScorerId ?? null,
  }
}

export function TournamentPredictionForm({
  teams,
  players,
  initial,
  onSubmit,
}: TournamentPredictionFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TournamentPredictionValues>({
    resolver: zodResolver(tournamentPredictionSchema),
    mode: 'onBlur',
    defaultValues: initialValues(initial),
  })

  const values = watch()
  const podiumError = errors.championId?.message

  const submit = async (formValues: TournamentPredictionValues) => {
    setServerError(null)
    const payload: UpsertTournamentPredictionPayload = {
      champion_id: formValues.championId,
      runner_up_id: formValues.runnerUpId,
      third_place_id: formValues.thirdPlaceId,
      fourth_place_id: formValues.fourthPlaceId,
      top_scorer_id: formValues.topScorerId,
    }
    try {
      await onSubmit(payload)
      toast({ title: '¡Pronóstico del torneo guardado!' })
    } catch (error) {
      const apiError = getApiError(error)
      const messages = apiError?.details?.errors
      setServerError(
        messages?.length
          ? messages.join(' ')
          : (apiError?.message ?? 'No se pudo guardar. Probá de nuevo.'),
      )
    }
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      aria-label="Pronóstico del torneo"
      className="flex flex-col gap-6"
    >
      {serverError && (
        <p
          role="alert"
          className="bg-danger-soft text-danger flex items-center gap-2 rounded-lg px-3 py-2 text-body-sm"
        >
          <AlertCircle size={16} aria-hidden="true" />
          {serverError}
        </p>
      )}

      <fieldset className="flex flex-col gap-3">
        <legend className="text-text-primary text-body-sm mb-1 font-semibold">
          Podio
        </legend>
        <PodiumPicker
          teams={teams}
          value={{
            championId: values.championId,
            runnerUpId: values.runnerUpId,
            thirdPlaceId: values.thirdPlaceId,
            fourthPlaceId: values.fourthPlaceId,
          }}
          onChange={(spot: PodiumSpot, teamId) =>
            setValue(spot, teamId, { shouldValidate: true, shouldDirty: true })
          }
        />
        {podiumError && (
          <p role="alert" className="text-danger text-body-sm">
            {podiumError}
          </p>
        )}
      </fieldset>

      <TopScorerPicker
        players={players}
        value={values.topScorerId}
        onChange={(playerId) =>
          setValue('topScorerId', playerId, {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
      />

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? 'Guardando…' : 'Guardar pronóstico'}
      </Button>
    </form>
  )
}
