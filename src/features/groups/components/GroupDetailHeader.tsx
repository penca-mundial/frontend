import { type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Share2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GroupManagementMenu } from '@/features/groups/components/GroupManagementMenu'
import { toast } from '@/hooks/useToast'
import type { Group } from '@/types/domain'

export interface GroupDetailHeaderProps {
  group: Group
}

/**
 * Detail header: back link, name + owner badge, description, member count
 * (and "creada por @x" once the backend exposes the creator), plus a share-code
 * action on private pencas. The management ("...") menu is intentionally not
 * rendered here — it lands with SCRUM-279.
 */
export function GroupDetailHeader({ group }: GroupDetailHeaderProps) {
  const memberLabel = `${group.memberCount} ${
    group.memberCount === 1 ? 'miembro' : 'miembros'
  }`

  async function handleShare(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    const url = `${window.location.origin}/app/groups/join?code=${group.code}`
    const shareData = {
      title: `Penca ${group.name}`,
      text: `Sumate a "${group.name}" en Penca Mundial con el código ${group.code}.`,
      url,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User dismissed the share sheet — nothing to do.
      }
      return
    }
    try {
      await navigator.clipboard.writeText(group.code)
      toast({ title: 'Código copiado', description: group.code })
    } catch {
      toast({ variant: 'destructive', title: 'No se pudo copiar el código' })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="text-text-secondary -ml-2 w-fit"
      >
        <Link to="/app/groups">
          <ArrowLeft aria-hidden="true" />
          Volver
        </Link>
      </Button>

      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-display-lg font-display font-semibold">
              {group.name}
            </h1>
            {group.isOwner && <Badge variant="outline">owner</Badge>}
          </div>
          {/* "..." management menu — private pencas only (not the general pool). */}
          {!group.isGeneralPool && <GroupManagementMenu group={group} />}
        </div>
        {group.description && (
          <p className="text-text-secondary text-body">{group.description}</p>
        )}
        <p className="text-text-secondary text-body-sm">
          {memberLabel}
          {group.ownerUsername && <> · creada por {group.ownerUsername}</>}
        </p>
      </div>

      {!group.isGeneralPool && (
        <div className="flex items-center gap-2">
          <span className="border-border bg-surface-muted text-text-secondary rounded-md border px-2.5 py-1 font-mono text-body-sm tracking-wider">
            {group.code}
          </span>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 aria-hidden="true" />
            Compartir código
          </Button>
        </div>
      )}
    </div>
  )
}
