// app/(public)/auth/google/callback/page.tsx
"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/button";
import { AuthCard } from "@/components/form";
import { PublicShell } from "../../../_shell";

/**
 * OAuth callback — pantalla intermedia al volver de Google.
 *
 * Flujo:
 *  1) Al mount, hacemos GET /auth/me.
 *  2) Si responde 200 con needs_username === true → /onboarding/username.
 *  3) Si responde 200 con needs_username === false → /app/home.
 *  4) Si responde 401 → /login?error=oauth_failed.
 *  5) Si la URL trae ?error=use_password → mostramos card explicativo.
 *
 * En la práctica el usuario ve esta pantalla menos de 1 segundo.
 */

export default function OAuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const errorParam = params.get("error");

  React.useEffect(() => {
    if (errorParam === "use_password") return; // mostramos card explicativo
    let mounted = true;

    (async () => {
      try {
        const res = await fetch("/auth/me", { credentials: "include" });
        if (!mounted) return;
        if (res.status === 401) { router.replace("/login?error=oauth_failed"); return; }
        const body = await res.json();
        router.replace(body.needs_username ? "/onboarding/username" : "/app/home");
      } catch {
        if (mounted) router.replace("/login?error=oauth_failed");
      }
    })();

    return () => { mounted = false; };
  }, [errorParam, router]);

  if (errorParam === "use_password") {
    return (
      <PublicShell narrow>
        <AuthCard
          title="Esa cuenta ya existe con contraseña"
          subtitle="El email de Google ya está registrado con contraseña. Ingresá con email y contraseña, o desde tu perfil podés vincular Google después."
        >
          <Button variant="primary" size="lg" fullWidth asChild>
            <Link href="/login">Ir a login</Link>
          </Button>
        </AuthCard>
      </PublicShell>
    );
  }

  return (
    <PublicShell narrow>
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Spinner />
        <p className="text-sm text-text-secondary">Te estamos ingresando…</p>
        <p className="font-mono text-[11.5px] text-text-disabled">
          Verificando con Google · OAuth 2.0
        </p>
        <span className="sr-only" role="status" aria-live="polite">
          Cargando, te estamos ingresando.
        </span>
      </div>
    </PublicShell>
  );
}

function Spinner() {
  return (
    <svg
      width={36} height={36} viewBox="0 0 24 24" aria-hidden="true"
      className="animate-spin text-brand-primary"
    >
      <circle
        cx="12" cy="12" r="9"
        stroke="currentColor" strokeWidth="2.5" fill="none"
        strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round"
      />
    </svg>
  );
}
