import { CreateGroupForm } from '@/features/groups/components/CreateGroupForm'

/**
 * "Crear penca" (`/app/groups/new`). A compact form to create a private penca;
 * on success it returns to the pencas list (where the new penca shows with its
 * invite code), so it does not navigate to the detail.
 */
export function CreateGroupPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-display-lg font-display font-semibold">
          Crear penca
        </h1>
        <p className="text-text-secondary text-body-sm">
          Armá tu penca privada e invitá a tus amigos con el código.
        </p>
      </div>
      <CreateGroupForm />
    </div>
  )
}
