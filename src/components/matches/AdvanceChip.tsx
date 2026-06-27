import { Check, X } from 'lucide-react'
import type { Match } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'
import { advancePick } from '@/features/matches/utils'
import { cn } from '@/lib/cn'

export interface AdvanceChipProps {
  match: Match
  prediction: Prediction | null
}

/**
 * Post-result chip surfacing the viewer's advancing pick on a finished knockout
 * match — "Avance <team>" in green when right, red when wrong — so the
 * advancing call (worth points) is visible, not just the score. Mirrors the
 * "Tu pronóstico" chip (same shape + green/red tokens). Renders nothing when it
 * doesn't apply (group stage, no pick, match not finished).
 *
 * Used on the Calendar fixture card and the Home result card. The bracket has
 * its own advance treatment (tinted row) and does NOT use this.
 */
export function AdvanceChip({ match, prediction }: AdvanceChipProps) {
  const pick = advancePick(match, prediction)
  if (!pick) return null
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap',
        pick.correct
          ? 'bg-success-soft text-[#166534]'
          : 'bg-danger-soft text-[#991B1B]',
      )}
    >
      {pick.correct ? (
        <Check size={11} strokeWidth={2.5} />
      ) : (
        <X size={11} strokeWidth={2.5} />
      )}
      Avance {pick.team.name}
    </span>
  )
}
