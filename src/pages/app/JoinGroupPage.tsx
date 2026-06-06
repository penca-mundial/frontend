import { JoinGroupForm } from '@/features/groups/components/JoinGroupForm'

/**
 * "Unirme con código" (`/app/groups/join`). Enter (or follow an invite link
 * that pre-fills) a penca's code to join it. On success it returns to the
 * pencas list, where the joined penca shows up.
 */
export function JoinGroupPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-display-lg font-display font-semibold">
          Unirme con código
        </h1>
        <p className="text-text-secondary text-body-sm">
          Ingresá el código de invitación de la penca para sumarte.
        </p>
      </div>
      <JoinGroupForm />
    </div>
  )
}
