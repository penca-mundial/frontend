import type { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * SectionLabel — the canonical "section label" typography used across the app
 * for sub-headings and field/group labels (e.g. "Tu pronóstico", the stats-card
 * labels, bracket round titles, the fixture day header).
 *
 * API:
 *   - Always renders text-body-sm + font-medium in the default body family
 *     (Inter). Purely typographic — it carries NO padding/margin.
 *   - `tone="primary"` (default) → primary text color, for the label itself.
 *     `tone="secondary"` → secondary text color, for a sub-detail shown next to
 *     a primary label (e.g. "de 72").
 *   - Does NOT transform casing: pass already-cased text ("Tu pronóstico"), not
 *     UPPERCASE — there is no auto uppercase/sentence-case.
 *   - Renders a <span> by default; pass `as="h2" | "h3" | "legend" | ...` when
 *     the label is also a semantic heading/legend. Layout (flex, margins, text
 *     alignment) goes through `className` at the call site.
 */
const TONES = {
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
} as const

export interface SectionLabelProps {
  as?: ElementType
  tone?: keyof typeof TONES
  className?: string
  children?: ReactNode
}

export function SectionLabel({
  as: Component = 'span',
  tone = 'primary',
  className,
  children,
}: SectionLabelProps) {
  return (
    <Component
      className={cn('text-body-sm font-medium', TONES[tone], className)}
    >
      {children}
    </Component>
  )
}
