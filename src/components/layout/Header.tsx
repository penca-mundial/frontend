import { useState } from 'react'
import { Menu } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
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
  { to: '/app/fixture', label: 'Fixture' },
  { to: '/app/groups', label: 'Grupos' },
  { to: '/app/rankings', label: 'Rankings' },
  { to: '/app/profile', label: 'Perfil' },
]

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'hover:text-foreground text-sm font-medium transition-colors',
    isActive ? 'text-foreground' : 'text-muted-foreground',
  )
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
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <NavLink to="/app/home" className="text-lg font-bold">
          Penca Mundial
        </NavLink>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>

        {/* Mobile navigation */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Abrir menú"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Penca Mundial</SheetTitle>
            </SheetHeader>
            <nav className="mt-2 flex flex-col gap-3 px-4">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={navLinkClass}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleLogout}
              >
                Cerrar sesión
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
