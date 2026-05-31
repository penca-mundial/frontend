import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  PredictionEditor,
  type PredictionInput,
} from '@/components/matches/PredictionEditor'
import type { Match } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'
import { cn } from '@/lib/cn'

export interface PredictionSheetProps {
  match: Match
  initial?: Prediction | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (input: PredictionInput) => Promise<void> | void
}

/**
 * Bottom sheet (mobile) / centered dialog (md+) wrapping a PredictionEditor.
 * Controlled by the parent so it can be opened from any surface (fixture row,
 * home next-match card, …).
 */
export function PredictionSheet({
  match,
  initial,
  open,
  onOpenChange,
  onSave,
}: PredictionSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className={cn(
          'bg-surface gap-0 rounded-t-[20px] border-0 p-0',
          'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
          'md:mx-auto md:mt-[20vh] md:mb-auto md:max-w-md md:rounded-2xl md:border md:border-border',
        )}
      >
        {/* Drag handle (mobile only). */}
        <div className="flex justify-center pt-2 pb-1 md:hidden" aria-hidden="true">
          <div className="bg-border-strong h-1 w-9 rounded-sm" />
        </div>

        <SheetTitle className="sr-only">Editar pronóstico</SheetTitle>
        <SheetDescription className="sr-only">
          {match.homeTeam?.name ?? 'Local'} contra{' '}
          {match.awayTeam?.name ?? 'Visitante'}
        </SheetDescription>

        <PredictionEditor
          match={match}
          initial={initial}
          onSave={onSave}
          onCancel={() => onOpenChange(false)}
          variant="sheet"
        />
      </SheetContent>
    </Sheet>
  )
}
