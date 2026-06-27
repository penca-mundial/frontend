import { Check, X } from 'lucide-react'
import type { Match } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'
import { advancePick } from '@/features/matches/utils'
import { cn } from '@/lib/cn'

export interface AdvanceChipProps {
  match: Match
  prediction: Prediction | null
}

const CHIP_BASE =
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap'

/**
 * Chip surfacing the viewer's advancing pick on a knockout match so the
 * advancing call (worth points) is visible, not just the score:
 *   - before the match is decided (live/upcoming) → amber "Tu pick: <team> pasa";
 *   - once finished → green "Avance <team>" if right, red if wrong.
 * Mirrors the "Tu pronóstico" chip shape + tokens. Renders nothing when it
 * doesn't apply (group stage, no pick).
 *
 * Used on the Calendar fixture card and the Home cards (live / próximo /
 * result). The bracket has its own advance treatment (tinted row) and does NOT
 * use this.
 */
export function AdvanceChip({ match, prediction }: AdvanceChipProps) {
  const pick = advancePick(match, prediction)
  if (!pick) return null

  if (pick.state === 'pending') {
    return (
      <span className={cn(CHIP_BASE, 'bg-brand-accent-soft text-[#92400E]')}>
        Tu pick: {pick.team.name} pasa
      </span>
    )
  }

  const correct = pick.state === 'correct'
  return (
    <span
      className={cn(
        CHIP_BASE,
        correct
          ? 'bg-success-soft text-[#166534]'
          : 'bg-danger-soft text-[#991B1B]',
      )}
    >
      {correct ? (
        <Check size={11} strokeWidth={2.5} />
      ) : (
        <X size={11} strokeWidth={2.5} />
      )}
      Avance {pick.team.name}
    </span>
  )
}
