import * as React from 'react'
import { MinusIcon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'

export interface PredictionStepperProps {
  /** Accessible label for the control (e.g. the team name). */
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * Numeric score input with `+`/`−` buttons and a focusable `spinbutton` value
 * that responds to arrow keys (and Home/End). Touch targets are ≥44px on
 * mobile (`size-11`) and tighten to 36px from `md`. Captures input only — it
 * holds no scoring logic.
 */
export function PredictionStepper({
  label,
  value,
  onChange,
  min = 0,
  max = 20,
  disabled = false,
  className,
}: PredictionStepperProps) {
  const setValue = (next: number) => {
    if (disabled) return
    onChange(clamp(next, min, max))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        event.preventDefault()
        setValue(value + 1)
        break
      case 'ArrowDown':
      case 'ArrowLeft':
        event.preventDefault()
        setValue(value - 1)
        break
      case 'Home':
        event.preventDefault()
        setValue(min)
        break
      case 'End':
        event.preventDefault()
        setValue(max)
        break
      default:
        break
    }
  }

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      role="group"
      aria-label={label}
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-11 md:size-9"
        aria-label={`Restar gol: ${label}`}
        disabled={disabled || value <= min}
        onClick={() => setValue(value - 1)}
      >
        <MinusIcon />
      </Button>
      <div
        role="spinbutton"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        className={cn(
          'text-mono-score flex min-w-11 items-center justify-center rounded-md px-2 tabular-nums select-none',
          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
          disabled && 'text-text-disabled',
        )}
      >
        {value}
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-11 md:size-9"
        aria-label={`Sumar gol: ${label}`}
        disabled={disabled || value >= max}
        onClick={() => setValue(value + 1)}
      >
        <PlusIcon />
      </Button>
    </div>
  )
}
