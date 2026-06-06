import { useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, Loader2 } from 'lucide-react'
import { getApiError } from '@/api/auth.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useJoinGroup } from '@/features/groups/hooks/useJoinGroup'
import {
  joinGroupSchema,
  type JoinGroupValues,
} from '@/features/groups/schemas'
import { toast } from '@/hooks/useToast'

/**
 * Route the backend's (already-translated) messages: anything mentioning the
 * code / a missing group lands on the field; everything else (e.g. a full
 * penca) bubbles up as a form-level error.
 */
function splitErrors(messages: string[]) {
  const result: { code?: string; generic?: string } = {}
  for (const message of messages) {
    if (/c[oó]digo|code|no existe/i.test(message)) result.code ??= message
    else result.generic ??= message
  }
  return result
}

export function JoinGroupForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const joinGroup = useJoinGroup()
  const [formError, setFormError] = useState<string | null>(null)
  const formErrorId = useId()

  // Pre-fill from an invite link, e.g. /app/groups/join?code=PIZZA124.
  const initialCode = (searchParams.get('code') ?? '').trim().toUpperCase()

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<JoinGroupValues>({
    resolver: zodResolver(joinGroupSchema),
    mode: 'onBlur',
    defaultValues: { code: initialCode },
  })

  useEffect(() => {
    setFocus('code')
  }, [setFocus])

  const onSubmit = async (values: JoinGroupValues) => {
    setFormError(null)
    try {
      const group = await joinGroup.mutateAsync(values.code)
      toast({ title: `Te uniste a ${group.name}` })
      navigate('/app/groups')
    } catch (error) {
      const messages = getApiError(error)?.details?.errors
      if (Array.isArray(messages) && messages.length > 0) {
        const { code, generic } = splitErrors(messages)
        if (code) setError('code', { message: code })
        setFormError(generic ?? (code ? null : messages[0]))
      } else {
        setFormError('No pudimos unirte a la penca. Probá de nuevo.')
      }
    }
  }

  const codeError = errors.code?.message
  const codeField = register('code')

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Unirme con código"
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
        <Label htmlFor="group-code">Código de invitación</Label>
        <Input
          id="group-code"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          maxLength={8}
          placeholder="PIZZA124"
          aria-invalid={codeError ? true : undefined}
          className="font-mono tracking-widest uppercase"
          {...codeField}
          onChange={(event) => {
            // Force uppercase as the user types so the value matches the codes.
            event.target.value = event.target.value.toUpperCase()
            void codeField.onChange(event)
          }}
        />
        {codeError ? (
          <p className="text-danger text-body-sm">{codeError}</p>
        ) : (
          <p className="text-text-secondary text-body-sm">
            Pedile el código a quien creó la penca (8 caracteres).
          </p>
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
          {isSubmitting ? 'Uniéndote…' : 'Unirme'}
        </Button>
      </div>
    </form>
  )
}
