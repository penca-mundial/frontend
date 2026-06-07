import { Construction } from 'lucide-react'

/**
 * Profile placeholder. The user dropdown already links here; the real profile
 * editor (avatar, timezone, password) arrives in its own ticket. Until then
 * this renders a styled "under construction" state instead of a 404.
 */
export function ProfilePage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <h1 className="text-display-lg font-display font-semibold">Perfil</h1>

      <section className="border-border bg-surface flex flex-col items-center rounded-xl border px-6 py-12 text-center">
        <div className="bg-brand-primary-soft text-brand-primary inline-flex size-12 items-center justify-center rounded-full">
          <Construction size={24} strokeWidth={2} aria-hidden="true" />
        </div>
        <h2 className="font-display text-text-primary mt-4 text-lg font-bold tracking-tight">
          Esta sección está en construcción
        </h2>
        <p className="text-text-secondary mx-auto mt-1 max-w-[360px] text-sm leading-relaxed">
          Pronto vas a poder editar tu perfil desde acá. Mientras tanto, podés
          seguir jugando con normalidad.
        </p>
      </section>
    </div>
  )
}
