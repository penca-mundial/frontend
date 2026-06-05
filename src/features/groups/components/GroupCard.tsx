import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Group } from '@/types/domain'
import { cn } from '@/lib/cn'

export interface GroupCardProps {
  group: Group
}

/**
 * A single penca in the "Pencas" list. Shows the name, member count and a
 * badge for the general pool / for groups the user owns. The whole card is a
 * link into the group detail (stretched, keyboard-navigable); the invite code
 * is intentionally not shown here — it lives in the detail (SCRUM-148).
 */
export function GroupCard({ group }: GroupCardProps) {
  const memberLabel = `${group.memberCount} ${
    group.memberCount === 1 ? 'miembro' : 'miembros'
  }`

  return (
    <section
      className={cn(
        'relative flex items-center gap-3 rounded-xl border p-4 transition-colors',
        // The general pool is highlighted with a subtle teal tint; private
        // groups use the standard surface card.
        group.isGeneralPool
          ? 'border-brand-primary/30 bg-brand-primary-soft/30 hover:border-brand-primary/50'
          : 'border-border bg-surface hover:border-border-strong',
        // Card-wide focus ring when the stretched link is keyboard-focused.
        'has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-2',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-body-lg truncate font-semibold">
            {group.name}
          </h2>
          {group.isGeneralPool && <Badge variant="secondary">General</Badge>}
          {group.isOwner && <Badge variant="outline">Creador</Badge>}
        </div>
        <p className="text-text-secondary text-body-sm mt-0.5">{memberLabel}</p>
      </div>

      <ArrowRight
        aria-hidden="true"
        className="text-text-disabled size-5 shrink-0"
      />

      {/* Stretched link: covers the card so the whole thing is clickable while
          keeping a single accessible link with a clear name. */}
      <Link
        to={`/app/groups/${group.id}`}
        className="absolute inset-0 rounded-xl focus:outline-none"
      >
        <span className="sr-only">Ver {group.name}</span>
      </Link>
    </section>
  )
}
