import { useState } from 'react'
import { ChevronDown, Menu } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { cn } from '@/lib/cn'

interface NavItem {
  to: string
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/app/home', label: 'Inicio' },
  { to: '/app/matches', label: 'Fixture' },
  { to: '/app/predictions/mine', label: 'Mis pronósticos' },
  { to: '/app/groups', label: 'Pencas' },
  { to: '/app/rankings', label: 'Ranking' },
]

/** Brand mark: green "P" tile with an amber dot, next to the wordmark. */
export function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="bg-brand-primary font-display relative inline-flex size-7 items-center justify-center rounded-lg font-extrabold text-white shadow-sm">
        P
        <span className="bg-brand-accent absolute -right-0.5 bottom-0.5 size-1.5 rounded-full" />
      </span>
      <span className="font-display text-text-primary leading-none font-bold tracking-tight">
        Magic <span className="font-serif font-normal italic opacity-70">Penca</span>
      </span>
    </span>
  )
}

function desktopNavClass({ isActive }: { isActive: boolean }) {
  return cn(
    'relative inline-flex h-16 items-center px-3.5 text-body-sm font-medium transition-colors',
    isActive
      ? 'text-text-primary font-semibold'
      : 'text-text-secondary hover:text-text-primary',
  )
}

function initialsOf(name: string | null, email: string): string {
  const source = name ?? email
  return source.slice(0, 2).toUpperCase()
}

export function Header() {
  const { currentUser, logout } = useCurrentUser()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const items = currentUser?.isAdmin
    ? [...NAV_ITEMS, { to: '/admin', label: 'Admin' }]
    : NAV_ITEMS

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="bg-surface border-border sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/app/home" aria-label="Magic Penca" className="shrink-0">
          <Logo />
        </Link>

        {/* Desktop navigation: underlined active item. */}
        <nav className="hidden flex-1 items-center md:flex" aria-label="Principal">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} className={desktopNavClass}>
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span className="bg-brand-primary absolute right-3.5 bottom-0 left-3.5 h-0.5 rounded-sm" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Desktop user menu */}
        {currentUser && (
          <div className="ml-auto hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="border-border bg-surface-muted hover:bg-surface focus-visible:ring-ring inline-flex items-center gap-2 rounded-full border py-1 pr-2.5 pl-1 focus-visible:ring-2 focus-visible:outline-none">
                  <span className="bg-brand-primary font-display inline-flex size-7 items-center justify-center rounded-full text-xs font-bold text-white">
                    {initialsOf(currentUser.username, currentUser.email)}
                  </span>
                  <span className="text-body-sm font-semibold">
                    {currentUser.username ?? 'Tu cuenta'}
                  </span>
                  <ChevronDown size={12} className="text-text-secondary" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link to="/app/profile">Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/app/rules">Reglas</Link>
                </DropdownMenuItem>
                {currentUser.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">Panel de administración</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-danger focus:text-danger"
                >
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Mobile navigation */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto md:hidden"
              aria-label="Abrir menú"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-2 flex flex-col gap-1 px-4" aria-label="Principal">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-md px-2 py-2 text-body font-medium transition-colors',
                      isActive
                        ? 'bg-brand-primary-soft text-brand-primary-hover'
                        : 'text-text-secondary hover:bg-surface-muted',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {currentUser && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </Button>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
