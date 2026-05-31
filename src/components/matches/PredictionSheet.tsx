import * as React from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

export interface PredictionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer: React.ReactNode
}

/**
 * Bottom sheet used on mobile (<768px) to capture a prediction. Editor content
 * goes in `children`; the action buttons go in `footer`. On desktop the same
 * editor is rendered inline instead (see MatchCardExpandable).
 */
export function PredictionSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: PredictionSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="gap-0 rounded-t-xl pb-[max(1rem,env(safe-area-inset-bottom))]">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description ? (
            <SheetDescription>{description}</SheetDescription>
          ) : null}
        </SheetHeader>
        <div className="px-4">{children}</div>
        <SheetFooter>{footer}</SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
