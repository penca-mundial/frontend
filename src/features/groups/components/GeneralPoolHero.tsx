import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { BrandSurface } from '@/components/brand/BrandSurface'
import { Badge } from '@/components/ui/badge'
import { useGroupRank } from '@/features/groups/hooks/useGroupRank'
import { formatThousands } from '@/lib/format'
import type { Group } from '@/types/domain'

export interface GeneralPoolHeroProps {
  group: Group
}

/**
 * The general pool as a hero card: a filled teal card (white text) with an
 * amber "POOL GENERAL" badge, fixed copy (not the stored name), and the user's
 * big rank out of every player. The whole card links to the pool detail.
 */
export function GeneralPoolHero({ group }: GeneralPoolHeroProps) {
  const { rankPosition, isLoading } = useGroupRank(group.id)

  return (
    <BrandSurface
      as={Link}
      to={`/app/groups/${group.id}`}
      className="focus-visible:ring-brand-primary shadow-sm transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <div className="flex items-center gap-4 p-5">
        <div className="min-w-0 flex-1">
          <Badge className="bg-brand-accent-soft border-transparent text-[11px] tracking-wide text-[#92400e]">
            POOL GENERAL
          </Badge>
          <h2 className="font-display text-display-md mt-2 font-semibold">
            Penca general
          </h2>
          <p className="text-body-sm mt-0.5 text-white/80">
            Estás compitiendo con todos los usuarios.
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end text-right">
          {isLoading ? (
            <div className="h-8 w-14 animate-pulse rounded bg-white/25" />
          ) : (
            <span className="font-display text-display-lg leading-none font-bold">
              {rankPosition != null ? `${rankPosition}º` : '—'}
            </span>
          )}
          <span className="text-body-sm mt-1 text-white/70">
            de {formatThousands(group.memberCount)} jugadores
          </span>
        </div>

        <ChevronRight
          aria-hidden="true"
          className="size-5 shrink-0 text-white/70"
        />
      </div>
    </BrandSurface>
  )
}
