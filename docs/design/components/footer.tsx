// components/footer.tsx
import * as React from "react";
import { Link } from "react-router-dom";
import { Logo } from "./header";

/**
 * AppFooter — footer minimal para AppLayout en desktop.
 * En mobile, el footer se reemplaza por el BottomNav (ver bottom-nav.tsx).
 *
 * PublicFooter — versión extendida usada en la landing.
 */

export function AppFooter({ version = "v1.0.0" }: { version?: string }) {
  return (
    <footer className="bg-surface border-t border-border py-5 px-6 text-center text-[11.5px] text-text-disabled font-mono">
      © {new Date().getFullYear()} Penca Mundial · {version}
    </footer>
  );
}

/* --- Footer extendido (Landing) ------------------------------------------- */

export function PublicFooter({ version = "v1.0.0" }: { version?: string }) {
  return (
    <footer className="bg-surface border-t border-border px-5 py-7 text-xs text-text-secondary md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Logo size="sm" />
          <p className="mt-2 leading-relaxed">
            Hecho con cariño rioplatense para el Mundial 2026.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 md:flex md:gap-12">
          <FooterCol title="Producto">
            <FooterLink href="/#como-funciona">Cómo funciona</FooterLink>
            <FooterLink href="/#reglas">Reglas</FooterLink>
          </FooterCol>
          <FooterCol title="Legal">
            <FooterLink href="/terms">Términos</FooterLink>
            <FooterLink href="/privacy">Privacidad</FooterLink>
          </FooterCol>
          <FooterCol title="Contacto">
            <FooterLink href="mailto:soporte@penca-mundial.app" external>
              Soporte
            </FooterLink>
            <FooterLink href="https://github.com/" external>
              GitHub
            </FooterLink>
          </FooterCol>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-7xl border-t border-border pt-4 text-[11px] text-text-disabled">
        © {new Date().getFullYear()} Penca Mundial · {version}
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-semibold uppercase tracking-[0.12em] text-[11px] text-text-secondary mb-1.5">
        {title}
      </div>
      <ul className="space-y-1">
        {React.Children.map(children, (child) => <li>{child}</li>)}
      </ul>
    </div>
  );
}

function FooterLink({
  href, children, external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener"
         className="hover:text-text-primary transition-colors">
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className="hover:text-text-primary transition-colors">
      {children}
    </Link>
  );
}
