import { type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { Copy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useGroupRank } from '@/features/groups/hooks/useGroupRank'
import { avatarColor, formatThousands, groupInitials } from '@/features/groups/utils'
import { toast } from '@/hooks/useToast'
import type { Group } from '@/types/domain'
import { cn } from '@/lib/cn'

export interface GroupCardProps {
  group: Group
}

/** The user's rank in this group, in amber, with a subtle loading placeholder. */
function RankBadge({ groupId, total }: { groupId: string; total: number }) {
  const { rankPosition, isLoading } = useGroupRank(groupId)
  return (
    <div className="flex shrink-0 flex-col items-end text-right">
      {isLoading ? (
        <div className="bg-surface-muted h-6 w-9 animate-pulse rounded" />
      ) : (
        <span
          className={cn(
            'font-display text-display-md leading-none font-bold',
            // 1º highlighted in brand green; every other position in primary.
            rankPosition === 1 ? 'text-brand-primary' : 'text-text-primary',
          )}
        >
          {rankPosition != null ? `${rankPosition}º` : '—'}
        </span>
      )}
      <span className="text-text-disabled text-body-sm mt-1">
        de {formatThousands(total)}
      </span>
    </div>
  )
}

/**
 * A private penca in the list: a name + owner badge, description, avatar, and
 * the user's rank, over a divider row with the invite code + a copy button.
 * The whole card links to the detail (stretched link); the copy button sits
 * above it (`z-10` + `stopPropagation`) so copying never navigates.
 */
export function GroupCard({ group }: GroupCardProps) {
  async function handleCopy(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(group.code)
      toast({ title: 'Código copiado', description: group.code })
    } catch {
      toast({
        variant: 'destructive',
        title: 'No se pudo copiar el código',
      })
    }
  }

  return (
    <section className="border-border bg-surface has-[a:focus-visible]:ring-ring relative flex flex-col rounded-xl border transition-colors hover:border-border-strong has-[a:focus-visible]:ring-2">
      <div className="flex items-start gap-3 p-4">
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-lg text-body-sm font-bold',
            avatarColor(group.name),
          )}
          aria-hidden="true"
        >
          {groupInitials(group.name)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-body-lg truncate font-semibold">
              {group.name}
            </h3>
            {group.isOwner && <Badge variant="outline">owner</Badge>}
          </div>
          {group.description && (
            <p className="text-text-secondary text-body-sm mt-0.5 truncate">
              {group.description}
            </p>
          )}
        </div>

        <RankBadge groupId={group.id} total={group.memberCount} />
      </div>

      <div className="border-border flex items-center justify-between gap-2 border-t px-4 py-2">
        <span className="text-text-secondary font-mono text-body-sm tracking-wider">
          {group.code}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="text-text-secondary hover:text-text-primary relative z-10 -mr-1.5 gap-1.5"
        >
          <Copy aria-hidden="true" />
          Copiar código
        </Button>
      </div>

      {/* Stretched link: covers the card so it's all clickable; the copy button
          (z-10) stays above it so copying doesn't trigger navigation. */}
      <Link
        to={`/app/groups/${group.id}`}
        className="absolute inset-0 rounded-xl focus:outline-none"
      >
        <span className="sr-only">Ver {group.name}</span>
      </Link>
    </section>
  )
}
