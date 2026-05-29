// components/header.tsx
import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, Calendar, Target, Users, Trophy, Search, Bell, ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * AppHeader — nav superior del AppShell (desktop ≥ md).
 *
 * Para mobile, usar `<MobileHeader />` + `<BottomNav />` (en bottom-nav.tsx).
 *
 * Props:
 *  - user: el usuario logueado (con username + initials + avatar opcional)
 *  - notifications: contador opcional para el bell
 *  - isAdmin: si es admin, agrega link "Admin" al nav y opción en el dropdown
 *  - onLogout: handler de cerrar sesión
 *  - onOpenSearch: handler del botón de búsqueda (abre modal/command palette)
 */

export interface AppHeaderUser {
  username: string;
  initials: string;
  avatarUrl?: string | null;
  isAdmin?: boolean;
}

export interface AppHeaderProps {
  user: AppHeaderUser;
  notifications?: number;
  onOpenSearch?: () => void;
  onLogout: () => void;
}

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavLink[] = [
  { href: "/app/home",                     label: "Inicio", icon: Home },
  { href: "/app/matches",                  label: "Fixture", icon: Calendar },
  { href: "/app/predictions/mine",         label: "Mis pronósticos", icon: Target },
  { href: "/app/groups",                   label: "Pencas", icon: Users },
  { href: "/app/rankings",                 label: "Ranking", icon: Trophy },
];

export function AppHeader({ user, notifications, onOpenSearch, onLogout }: AppHeaderProps) {
  const location = useLocation();
  return (
    <header className="sticky top-0 z-40 h-16 bg-surface border-b border-border">
      <div className="mx-auto flex h-full max-w-7xl items-center gap-6 px-6">
        <Link to="/app/home" className="shrink-0">
          <Logo />
        </Link>

        <nav className="flex flex-1 gap-1" aria-label="Principal">
          {NAV.map((l) => {
            const active = location.pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                to={l.href}
                className={cn(
                  "relative inline-flex items-center gap-1.5 rounded-lg px-3.5 h-9 text-[13.5px] transition-colors",
                  active ? "font-bold text-text-primary" : "font-medium text-text-secondary hover:text-text-primary",
                )}
              >
                {l.label}
                {active && (
                  <span className="absolute bottom-[-16px] left-3.5 right-3.5 h-0.5 rounded-sm bg-brand-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <IconButton onClick={onOpenSearch} ariaLabel="Buscar">
            <Search size={18} />
          </IconButton>
          <IconButton ariaLabel="Notificaciones" badge={notifications}>
            <Bell size={18} />
          </IconButton>
          <UserMenu user={user} onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
}

/* --- Logo ----------------------------------------------------------------- */

export function Logo({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const scale = size === "lg" ? 1.4 : size === "sm" ? 0.85 : 1;
  const box = 28 * scale, fontMain = 16 * scale, fontWord = 16 * scale;
  return (
    <div className={cn("inline-flex items-center", className)} style={{ gap: 8 * scale }}>
      <span
        className="inline-flex items-center justify-center rounded-lg bg-brand-primary text-white shadow-sm font-display font-extrabold leading-none"
        style={{ width: box, height: box, fontSize: fontMain }}
      >
        <span className="relative inline-block">
          P
          <span
            className="absolute rounded-full bg-brand-accent"
            style={{ right: -3 * scale, bottom: 2 * scale, width: 6 * scale, height: 6 * scale }}
          />
        </span>
      </span>
      <span
        className="font-display font-bold text-text-primary leading-none tracking-tight"
        style={{ fontSize: fontWord }}
      >
        Penca <span className="font-normal italic opacity-70 font-serif">Mundial</span>
      </span>
    </div>
  );
}

/* --- Icon button (header utility) ----------------------------------------- */

function IconButton({
  children, badge, ariaLabel, onClick,
}: {
  children: React.ReactNode;
  badge?: number;
  ariaLabel: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button" aria-label={ariaLabel} onClick={onClick}
      className="relative inline-flex size-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-2 focus-visible:outline-brand-primary focus-visible:outline-offset-2"
    >
      {children}
      {badge != null && badge > 0 && (
        <span className="absolute right-1.5 top-1.5 inline-flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-brand-accent px-1 text-[9px] font-bold text-text-primary">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );
}

/* --- User menu (avatar + dropdown) ---------------------------------------- */
/* Implementación canónica abajo usa Radix DropdownMenu (vía shadcn). Si todavía
   no instalaste shadcn dropdown, te dejo un fallback comentado al final. */

import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

function UserMenu({ user, onLogout }: { user: AppHeaderUser; onLogout: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted py-1 pl-1 pr-2.5 hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand-primary focus-visible:outline-offset-2">
          <Avatar user={user} size={28} />
          <span className="text-[12.5px] font-semibold">{user.username}</span>
          <ChevronDown size={12} className="text-text-secondary" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem asChild>
          <Link to="/app/profile">Perfil</Link>
        </DropdownMenuItem>
        {user.isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin">Panel de administración</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="text-danger focus:text-danger">
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Avatar({ user, size = 28 }: { user: AppHeaderUser; size?: number }) {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl} alt={`Avatar de ${user.username}`}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-brand-primary text-white font-display font-bold leading-none"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-label={`Avatar de ${user.username}`}
    >
      {user.initials}
    </span>
  );
}
