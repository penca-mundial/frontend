import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2, MoreVertical } from 'lucide-react'
import { getApiError } from '@/api/auth.api'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  useDeleteGroup,
  useLeaveGroup,
  useUpdateGroup,
} from '@/features/groups/hooks/useGroupMutations'
import {
  createGroupSchema,
  GROUP_NAME_MAX,
  type CreateGroupValues,
} from '@/features/groups/schemas'
import { toast } from '@/hooks/useToast'
import type { Group } from '@/types/domain'

type DialogKind = 'leave' | 'edit' | 'delete' | null

/** Inline danger alert for a dialog. */
function DialogError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="border-danger/30 bg-danger-soft text-danger flex items-center gap-2 rounded-lg border p-3 text-body-sm"
    >
      <AlertCircle aria-hidden="true" className="size-4 shrink-0" />
      {message}
    </div>
  )
}

function LeaveDialog({
  group,
  open,
  onOpenChange,
}: {
  group: Group
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const leave = useLeaveGroup(group.id)
  const [error, setError] = useState<string | null>(null)

  async function handleLeave() {
    setError(null)
    try {
      await leave.mutateAsync()
      toast({ title: `Saliste de ${group.name}` })
      onOpenChange(false)
      navigate('/app/groups')
    } catch (caught) {
      setError(getApiError(caught)?.message ?? 'No pudimos sacarte de la penca.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Salir de {group.name}?</DialogTitle>
          <DialogDescription>
            Vas a dejar de participar en esta penca. Podés volver a unirte con su
            código.
          </DialogDescription>
        </DialogHeader>
        {error && <DialogError message={error} />}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleLeave}
            disabled={leave.isPending}
          >
            {leave.isPending && (
              <Loader2 aria-hidden="true" className="animate-spin" />
            )}
            Salir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteDialog({
  group,
  open,
  onOpenChange,
}: {
  group: Group
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const remove = useDeleteGroup(group.id)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setError(null)
    try {
      await remove.mutateAsync()
      toast({ title: `Eliminaste ${group.name}` })
      onOpenChange(false)
      navigate('/app/groups')
    } catch (caught) {
      setError(getApiError(caught)?.message ?? 'No pudimos eliminar la penca.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar {group.name}?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. La penca se elimina para todos sus
            miembros.
          </DialogDescription>
        </DialogHeader>
        {error && <DialogError message={error} />}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={remove.isPending}
          >
            {remove.isPending && (
              <Loader2 aria-hidden="true" className="animate-spin" />
            )}
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Route the backend name error to the field; anything else is form-level. */
function splitErrors(messages: string[]) {
  const result: { name?: string; generic?: string } = {}
  for (const message of messages) {
    if (/nombre|name/i.test(message)) result.name ??= message
    else result.generic ??= message
  }
  return result
}

function EditDialog({
  group,
  open,
  onOpenChange,
}: {
  group: Group
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const update = useUpdateGroup(group.id)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateGroupValues>({
    resolver: zodResolver(createGroupSchema),
    mode: 'onBlur',
    defaultValues: { name: group.name, description: group.description ?? '' },
  })

  const onSubmit = async (values: CreateGroupValues) => {
    setFormError(null)
    try {
      await update.mutateAsync({
        name: values.name,
        description: values.description ? values.description : null,
      })
      toast({ title: 'Penca actualizada' })
      onOpenChange(false)
    } catch (caught) {
      const messages = getApiError(caught)?.details?.errors
      if (Array.isArray(messages) && messages.length > 0) {
        const { name, generic } = splitErrors(messages)
        if (name) setError('name', { message: name })
        setFormError(generic ?? (name ? null : messages[0]))
      } else {
        setFormError('No pudimos guardar los cambios. Probá de nuevo.')
      }
    }
  }

  const nameError = errors.name?.message
  const descriptionError = errors.description?.message

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar penca</DialogTitle>
          <DialogDescription>
            Cambiá el nombre o la descripción de tu penca.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          {formError && <DialogError message={formError} />}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-group-name">Nombre</Label>
            <Input
              id="edit-group-name"
              maxLength={GROUP_NAME_MAX}
              aria-invalid={nameError ? true : undefined}
              {...register('name')}
            />
            {nameError && <p className="text-danger text-body-sm">{nameError}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-group-description">Descripción (opcional)</Label>
            <Textarea
              id="edit-group-description"
              rows={3}
              aria-invalid={descriptionError ? true : undefined}
              {...register('description')}
            />
            {descriptionError && (
              <p className="text-danger text-body-sm">{descriptionError}</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 aria-hidden="true" className="animate-spin" />
              )}
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export interface GroupManagementMenuProps {
  group: Group
}

/**
 * The "..." management menu for a private penca: owners get Edit + Delete,
 * members get Leave (owners can't leave — the backend forbids it). Not rendered
 * for the general pool. Each item opens a confirmation / edit dialog.
 */
export function GroupManagementMenu({ group }: GroupManagementMenuProps) {
  const [dialog, setDialog] = useState<DialogKind>(null)
  const setOpen = (kind: DialogKind) => (open: boolean) =>
    setDialog(open ? kind : null)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Gestionar penca">
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {group.isOwner ? (
            <>
              <DropdownMenuItem onSelect={() => setDialog('edit')}>
                Editar penca
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setDialog('delete')}
                className="text-danger focus:text-danger"
              >
                Eliminar penca
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem
              onSelect={() => setDialog('leave')}
              className="text-danger focus:text-danger"
            >
              Salir de la penca
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <LeaveDialog
        group={group}
        open={dialog === 'leave'}
        onOpenChange={setOpen('leave')}
      />
      <EditDialog
        group={group}
        open={dialog === 'edit'}
        onOpenChange={setOpen('edit')}
      />
      <DeleteDialog
        group={group}
        open={dialog === 'delete'}
        onOpenChange={setOpen('delete')}
      />
    </>
  )
}
