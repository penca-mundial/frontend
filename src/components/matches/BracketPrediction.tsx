import { getApiError } from '@/api/auth.api'
import {
  PredictionEditor,
  type PredictionInput,
} from '@/components/matches/PredictionEditor'
import { PredictionSheet } from '@/components/matches/PredictionSheet'
import { useUpsertPrediction } from '@/features/matches/hooks/useUpsertPrediction'
import type { Match } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'
import { toast } from '@/hooks/useToast'

export interface BracketPredictionProps {
  match: Match
  initial?: Prediction | null
  onClose: () => void
}

/**
 * Shared save path for predicting a bracket cross. Reuses the Calendar's
 * `useUpsertPrediction`; the lock is enforced server-side (422), surfaced as a
 * toast — the front-side gate only decides the affordance shows.
 */
function useBracketPredictionSave(
  matchId: string,
  onClose: () => void,
): (input: PredictionInput) => Promise<void> {
  const upsert = useUpsertPrediction(matchId)
  return async (input) => {
    try {
      await upsert.mutateAsync({
        match_id: matchId,
        predicted_home_score: input.home,
        predicted_away_score: input.away,
        predicted_advancing_team_id: input.advancing,
      })
      toast({ title: '¡Pronóstico guardado!' })
      onClose()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo guardar el pronóstico',
        description: getApiError(error)?.message ?? 'Intentá de nuevo.',
      })
      // Keep the editor open so the user can retry / adjust.
    }
  }
}

/**
 * Desktop: the inline editor that fills the popover anchored to the focused
 * card — predicting "comes out of" the cross, like the fixture row expanding
 * under its card. The popover (in `KnockoutBracket`) owns the floating chrome;
 * this is just its content.
 */
export function BracketPredictionForm({
  match,
  initial,
  onClose,
}: BracketPredictionProps) {
  const handleSave = useBracketPredictionSave(match.id, onClose)
  return (
    <PredictionEditor
      match={match}
      initial={initial}
      onSave={handleSave}
      onCancel={onClose}
      variant="inline"
    />
  )
}

/** Mobile: the shared bottom sheet, same as the Calendar. */
export function BracketPredictionSheet({
  match,
  initial,
  onClose,
}: BracketPredictionProps) {
  const handleSave = useBracketPredictionSave(match.id, onClose)
  return (
    <PredictionSheet
      match={match}
      initial={initial}
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      onSave={handleSave}
    />
  )
}
