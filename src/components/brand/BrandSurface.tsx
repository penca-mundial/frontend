import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * BrandSurface — the reusable filled-teal surface with texture: a subtle
 * diagonal sheen plus low-opacity diagonal stripes over `bg-brand-primary`,
 * mirroring the landing CTA. White text by default; children render above the
 * texture (already `relative`), so consumers only bring layout + padding.
 *
 * Renders a <div> by default; pass `as={Link}` (plus its props, e.g. `to`)
 * when the whole surface is interactive. Shadows/focus rings go through
 * `className` at the call site.
 */
export type BrandSurfaceProps<E extends ElementType = 'div'> = {
  as?: E
  className?: string
  children?: ReactNode
} & Omit<ComponentPropsWithoutRef<E>, 'as' | 'className' | 'children'>

export function BrandSurface<E extends ElementType = 'div'>({
  as,
  className,
  children,
  ...props
}: BrandSurfaceProps<E>) {
  // The generic `E` is only there to type the pass-through props; the runtime
  // component is whatever the caller gave us (or a plain div).
  const Component: ElementType = as ?? 'div'

  return (
    <Component
      className={cn(
        'bg-brand-primary relative block overflow-hidden rounded-xl text-white',
        className,
      )}
      {...props}
    >
      {/* Texture: a leve diagonal sheen + subtle diagonal stripes over the
          teal, mirroring the landing CTA. Decorative, low-opacity. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(150deg, rgba(255,255,255,0.12), rgba(0,0,0,0.10))',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, transparent 0 18px, rgba(255,255,255,0.45) 18px 19px)',
        }}
      />
      <div className="relative">{children}</div>
    </Component>
  )
}
