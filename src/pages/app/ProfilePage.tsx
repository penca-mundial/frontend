import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { AvatarUploader } from '@/features/users/components/AvatarUploader'
import { ProfileForm } from '@/features/users/components/ProfileForm'
import { AccountSection } from '@/features/users/components/AccountSection'
import { SectionLabel } from '@/components/ui/section-label'
import { Skeleton } from '@/components/ui/skeleton'

/** "junio de 2026" — coarse month/year, locale es. Date-only, TZ-insensitive. */
function memberSince(iso: string): string {
  return new Intl.DateTimeFormat('es', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))
}

/**
 * "Mi perfil" (`/app/profile`, SCRUM-199). Header card (avatar with
 * click-to-upload + username + email + member-since), an "Información" section
 * to edit the username, and an auth-aware "Cuenta" section. No timezone field,
 * no avatar-URL input, and no account-deletion section — see the AC deviations
 * on the ticket. Timezone is auto-detected from the browser everywhere, so it
 * isn't managed here.
 */
export function ProfilePage() {
  const { currentUser } = useCurrentUser()

  if (!currentUser) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-display-lg font-display font-semibold">Mi perfil</h1>

      {/* Header card */}
      <section className="border-border bg-surface flex items-center gap-4 rounded-xl border p-5">
        <AvatarUploader
          avatarUrl={currentUser.avatarUrl}
          username={currentUser.username}
          email={currentUser.email}
        />
        <div className="min-w-0">
          <p className="font-display text-text-primary truncate text-lg font-bold">
            {currentUser.username ?? 'Sin nombre de usuario'}
          </p>
          <p className="text-text-secondary truncate text-body-sm">
            {currentUser.email}
          </p>
          {currentUser.createdAt && (
            <p className="text-text-disabled mt-0.5 text-body-sm">
              Miembro desde {memberSince(currentUser.createdAt)}
            </p>
          )}
        </div>
      </section>

      {/* Información */}
      <section className="border-border bg-surface flex flex-col gap-4 rounded-xl border p-5">
        <SectionLabel as="h2" className="text-text-primary">
          Información
        </SectionLabel>
        <ProfileForm username={currentUser.username} />
      </section>

      <AccountSection provider={currentUser.provider} />
    </div>
  )
}
