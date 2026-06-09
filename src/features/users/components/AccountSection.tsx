import { useNavigate, Link } from 'react-router-dom'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { Button } from '@/components/ui/button'
import { SectionLabel } from '@/components/ui/section-label'

/**
 * Profile "Cuenta" section (SCRUM-199). Shows the actions the backend actually
 * supports: changing the password (via the existing reset flow) and logging
 * out. The mock's Google-linkage status and "password last changed" line need
 * backend fields (`provider`, `password_changed_at`) that aren't exposed yet —
 * documented on the ticket and omitted rather than faked.
 */
export function AccountSection() {
  const { logout } = useCurrentUser()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <section className="border-border bg-surface flex flex-col gap-4 rounded-xl border p-5">
      <SectionLabel as="h2" className="text-text-primary">
        Cuenta
      </SectionLabel>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-body-sm text-text-primary font-medium">Contraseña</p>
          <p className="text-text-secondary text-body-sm">
            Cambiá tu contraseña por email.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/forgot-password">Cambiar contraseña</Link>
        </Button>
      </div>

      <div className="border-border border-t" />

      <Button
        variant="outline"
        size="sm"
        className="text-danger hover:text-danger self-start"
        onClick={handleLogout}
      >
        Cerrar sesión
      </Button>
    </section>
  )
}
