import { useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2 } from 'lucide-react'
import { getApiError } from '@/api/auth.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateGroup } from '@/features/groups/hooks/useCreateGroup'
import {
  createGroupSchema,
  GROUP_NAME_MAX,
  type CreateGroupValues,
} from '@/features/groups/schemas'
import { toast } from '@/hooks/useToast'

/**
 * Split the backend's (already-translated) validation messages: anything about
 * the name lands on that field, everything else (e.g. the 3-group owner limit)
 * bubbles up as a form-level error.
 */
function splitErrors(messages: string[]) {
  const result: { name?: string; generic?: string } = {}
  for (const message of messages) {
    if (/nombre|name/i.test(message)) result.name ??= message
    else result.generic ??= message
  }
  return result
}

export function CreateGroupForm() {
  const navigate = useNavigate()
  const createGroup = useCreateGroup()
  const [formError, setFormError] = useState<string | null>(null)
  const formErrorId = useId()

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<CreateGroupValues>({
    resolver: zodResolver(createGroupSchema),
    mode: 'onBlur',
    defaultValues: { name: '', description: '' },
  })

  useEffect(() => {
    setFocus('name')
  }, [setFocus])

  const onSubmit = async (values: CreateGroupValues) => {
    setFormError(null)
    try {
      await createGroup.mutateAsync({
        name: values.name,
        description: values.description ? values.description : null,
      })
      toast({ title: 'Penca creada' })
      navigate('/app/groups')
    } catch (error) {
      const messages = getApiError(error)?.details?.errors
      if (Array.isArray(messages) && messages.length > 0) {
        const { name, generic } = splitErrors(messages)
        if (name) setError('name', { message: name })
        setFormError(generic ?? (name ? null : messages[0]))
      } else {
        setFormError('No pudimos crear la penca. Probá de nuevo.')
      }
    }
  }

  const nameError = errors.name?.message
  const descriptionError = errors.description?.message

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Crear penca"
      className="border-border bg-surface flex flex-col gap-5 rounded-xl border p-5"
    >
      {formError && (
        <div
          id={formErrorId}
          role="alert"
          className="border-danger/30 bg-danger-soft text-danger flex flex-col gap-2 rounded-lg border p-3 text-body-sm"
        >
          <span className="flex items-center gap-2 font-medium">
            <AlertCircle aria-hidden="true" className="size-4 shrink-0" />
            {formError}
          </span>
          <Link
            to="/app/groups"
            className="text-danger w-fit font-semibold underline underline-offset-2"
          >
            Volver a mis pencas
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="group-name">Nombre</Label>
        <Input
          id="group-name"
          maxLength={GROUP_NAME_MAX}
          placeholder="Los Cracks del Asado"
          aria-invalid={nameError ? true : undefined}
          {...register('name')}
        />
        {nameError && <p className="text-danger text-body-sm">{nameError}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="group-description">Descripción (opcional)</Label>
        <Textarea
          id="group-description"
          rows={3}
          placeholder="Contales de qué se trata tu penca."
          aria-invalid={descriptionError ? true : undefined}
          {...register('description')}
        />
        {descriptionError && (
          <p className="text-danger text-body-sm">{descriptionError}</p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button asChild variant="outline">
          <Link to="/app/groups">Cancelar</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && (
            <Loader2 aria-hidden="true" className="animate-spin" />
          )}
          {isSubmitting ? 'Creando…' : 'Crear penca'}
        </Button>
      </div>
    </form>
  )
}
