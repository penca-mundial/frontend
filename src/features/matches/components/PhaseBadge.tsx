import { Badge } from '@/components/ui/badge'
import { getPhaseLabel } from '@/features/matches/utils'

export interface PhaseBadgeProps {
  phase: string
}

/** Small badge rendering the Spanish (rioplatense) label for a match phase. */
export function PhaseBadge({ phase }: PhaseBadgeProps) {
  return <Badge variant="secondary">{getPhaseLabel(phase)}</Badge>
}
