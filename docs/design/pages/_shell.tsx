// app/(public)/_shell.tsx
import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/header";
import { cn } from "@/lib/cn";

/**
 * PublicShell — layout para todas las pantallas anónimas (auth, onboarding,
 * confirm-email, forgot/reset password). Header simple con logo, contenido
 * centrado en card, footer minimal.
 */
export function PublicShell({
  children, narrow,
}: {
  children: React.ReactNode;
  narrow?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="flex h-[60px] items-center justify-center border-b border-border bg-surface px-5">
        <Link href="/" aria-label="Penca Mundial — inicio">
          <Logo />
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 pb-10 pt-8">
        <div className={cn("w-full", narrow ? "max-w-[420px]" : "max-w-[480px]")}>
          {children}
        </div>
      </main>

      <footer className="px-5 py-4 text-center font-mono text-[11px] text-text-disabled">
        © {new Date().getFullYear()} Penca Mundial · v1.0.0
      </footer>
    </div>
  );
}
