import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useGroupRank } from '@/features/groups/hooks/useGroupRank'
import { formatThousands } from '@/features/groups/utils'
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
  const { data: rank, isLoading } = useGroupRank(group.id)

  return (
    <Link
      to={`/app/groups/${group.id}`}
      className="bg-brand-primary focus-visible:ring-brand-primary relative flex items-center gap-4 overflow-hidden rounded-xl p-5 text-white shadow-sm transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <div className="min-w-0 flex-1">
        <Badge className="bg-brand-accent border-transparent text-[#422006]">
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
            {rank ? `${rank.rankPosition}º` : '—'}
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
    </Link>
  )
}
