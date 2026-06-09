import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, KeyRound } from 'lucide-react'
import { SectionLabel } from '@/components/ui/section-label'

/** Multicolor Google "G" glyph (decorative). */
function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.7-6.2 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3c-2 1.5-4.5 2.4-7.4 2.4-5.1 0-9.5-3.3-11.2-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.3 5.3c-.4.4 6.6-4.8 6.6-15 0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  )
}

/** One styled account row: leading icon, title + subtitle, and a trailing slot. */
function Row({
  icon,
  title,
  subtitle,
  trailing,
  to,
}: {
  icon: ReactNode
  title: string
  subtitle: string
  trailing: ReactNode
  to?: string
}) {
  const inner = (
    <>
      <span className="bg-surface-muted text-text-secondary inline-flex size-9 shrink-0 items-center justify-center rounded-full">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-text-primary text-body-sm block font-medium">
          {title}
        </span>
        <span className="text-text-secondary block text-body-sm">
          {subtitle}
        </span>
      </span>
      {trailing}
    </>
  )

  if (to) {
    return (
      <Link
        to={to}
        aria-label={`${title}: ${subtitle}`}
        className="hover:bg-surface-muted/60 focus-visible:ring-ring -mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        {inner}
      </Link>
    )
  }
  return (
    <div className="flex items-center gap-3 px-0 py-2.5">{inner}</div>
  )
}

export interface AccountSectionProps {
  /**
   * Auth provider (`google_oauth2`) or null for password accounts. Optional —
   * when absent (backend field not deployed yet) it degrades to the password
   * row. The Google row only shows on a confirmed `google_oauth2`.
   */
  provider: string | null | undefined
}

/**
 * Profile "Cuenta" section (SCRUM-199, visual pass). Auth-method aware, styled
 * rows (icon + title + subtitle + trailing). Google accounts show a linked
 * "Conectado" row and no password action; password accounts (and the
 * not-yet-deployed-field fallback) show a "Cambiar contraseña" row that links
 * to the existing reset flow. No "changed N days ago" line (not exposed) and no
 * logout button (that lives in the header user menu).
 */
export function AccountSection({ provider }: AccountSectionProps) {
  const isGoogle = provider === 'google_oauth2'

  return (
    <section className="border-border bg-surface flex flex-col gap-1 rounded-xl border p-5">
      <SectionLabel as="h2" className="text-text-primary mb-2">
        Cuenta
      </SectionLabel>

      {isGoogle ? (
        <Row
          icon={<GoogleGlyph />}
          title="Google"
          subtitle="Iniciás sesión con tu cuenta de Google."
          trailing={
            <span className="bg-success-soft text-success inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
              Conectado
            </span>
          }
        />
      ) : (
        <Row
          to="/forgot-password"
          icon={<KeyRound className="size-4" />}
          title="Contraseña"
          subtitle="Cambiá tu contraseña por email."
          trailing={
            <ChevronRight
              className="text-text-disabled size-4 shrink-0"
              aria-hidden="true"
            />
          }
        />
      )}
    </section>
  )
}
