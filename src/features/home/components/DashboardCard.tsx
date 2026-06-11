import { useId, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface DashboardCardAction {
  to: string
  label: string
}

export interface DashboardCardProps {
  title: string
  /** Optional node shown next to the title (e.g. a "Bloqueado" badge). */
  headerAccessory?: ReactNode
  /** Optional "see more" link rendered at the card's top-right. */
  action?: DashboardCardAction
  /**
   * Optional node pinned to the card's top-right (e.g. a live badge or a trophy
   * icon). Ignored when `action` is set — the link takes that slot.
   */
  headerRight?: ReactNode
  className?: string
  children: ReactNode
}

/**
 * The canonical dashboard card chrome: the project card surface
 * (`border bg-surface rounded-xl`) with an `<h2>` title row, an optional header
 * accessory, and an optional top-right link. Every Home card composes this so
 * the grid stays visually uniform (Open/Closed: extend via the slots, don't
 * restyle each card). It is a section, so the title is the labelling heading.
 */
export function DashboardCard({
  title,
  headerAccessory,
  action,
  headerRight,
  className,
  children,
}: DashboardCardProps) {
  const titleId = useId()
  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        'border-border bg-surface flex flex-col gap-4 rounded-xl border p-4',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2
            id={titleId}
            className="text-text-secondary text-[11px] font-semibold tracking-wide uppercase"
          >
            {title}
          </h2>
          {headerAccessory}
        </div>
        {action ? (
          <Link
            to={action.to}
            className="text-brand-primary focus-visible:ring-ring inline-flex items-center gap-1 rounded-sm text-body-sm font-medium focus-visible:ring-2 focus-visible:outline-none"
          >
            {action.label}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        ) : (
          headerRight
        )}
      </div>
      {children}
    </section>
  )
}
