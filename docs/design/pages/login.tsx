// app/(public)/login/page.tsx
"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/button";
import {
  AuthCard, Field, Input, PasswordField, GoogleBtn, OrDivider, InlineAlert,
} from "@/components/form";
import { PublicShell } from "./_shell";

/**
 * Login — autenticación con email/password o Google.
 *
 * Estados manejados:
 *  - idle              → formulario listo
 *  - submitting        → spinner en botón, inputs deshabilitados
 *  - error general     → banner de error encima del form (credentials / unconfirmed / banned)
 *  - error de campo    → mensaje específico bajo cada input (Zod)
 *  - reset=success     → toast verde sticky de "Contraseña actualizada"
 *  - error=oauth_failed→ banner si volvió rebotado del OAuth callback
 */

const schema = z.object({
  email: z.string().min(1, "El email no puede estar vacío.").email("Esto no parece un email — falta el @ o el dominio."),
  password: z.string().min(1, "La contraseña no puede estar vacía."),
});
type FormValues = z.infer<typeof schema>;

type ServerError =
  | { kind: "credentials" }
  | { kind: "unconfirmed"; email: string }
  | { kind: "banned" }
  | { kind: "unknown" };

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const resetSuccess = params.get("reset") === "success";
  const oauthFailed = params.get("error") === "oauth_failed";

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onBlur" });

  const [serverError, setServerError] = React.useState<ServerError | null>(
    oauthFailed ? { kind: "credentials" } : null
  );

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      // Reemplazá por tu cliente HTTP. Devuelve { ok: boolean, redirectTo?: string }
      const res = await fetch("/auth/sign_in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.status === 401) { setServerError({ kind: "credentials" }); return; }
      if (res.status === 403) {
        const body = await res.json();
        if (body.error === "unconfirmed") {
          setServerError({ kind: "unconfirmed", email: values.email });
          return;
        }
        if (body.error === "banned") { setServerError({ kind: "banned" }); return; }
      }
      if (!res.ok) { setServerError({ kind: "unknown" }); return; }

      const next = params.get("redirect_to") || "/app/home";
      router.push(next);
    } catch (e) {
      setServerError({ kind: "unknown" });
    }
  };

  const resendConfirmation = async (email: string) => {
    await fetch("/auth/confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  };

  return (
    <PublicShell narrow>
      {resetSuccess && (
        <InlineAlert tone="success">
          Contraseña actualizada. Ingresá con la nueva.
        </InlineAlert>
      )}

      <AuthCard
        title="Bienvenido de vuelta"
        subtitle="Ingresá con tu email o con Google."
        footer={
          <>
            ¿Todavía no tenés cuenta?{" "}
            <Link href="/signup" className="font-semibold text-brand-primary underline">
              Crear cuenta
            </Link>
          </>
        }
      >
        <ServerErrorBanner err={serverError} onResend={resendConfirmation} />

        <GoogleBtn
          onClick={() => {
            const base = process.env.NEXT_PUBLIC_API_URL ?? "";
            window.location.href = `${base}/auth/google_oauth2`;
          }}
        />
        <OrDivider />

        <form onSubmit={handleSubmit(onSubmit)} aria-label="Iniciar sesión" noValidate>
          <Field label="Email" error={errors.email?.message}>
            <Input
              type="email" autoComplete="email" placeholder="vos@ejemplo.com"
              disabled={isSubmitting}
              {...register("email")}
            />
          </Field>

          <PasswordField
            label="Contraseña"
            value={watch("password") ?? ""}
            onChange={(v) => setValue("password", v, { shouldValidate: true })}
            error={errors.password?.message}
            autoComplete="current-password"
          />

          <div className="-mt-2 mb-4 text-right">
            <Link href="/forgot-password" className="text-xs font-semibold text-brand-primary underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button
            type="submit" variant="primary" size="lg" fullWidth
            disabled={!isValid || isSubmitting}
            loading={isSubmitting}
          >
            {isSubmitting ? "Ingresando…" : "Ingresar"}
          </Button>
        </form>
      </AuthCard>
    </PublicShell>
  );
}

/* ------------------------------------------------------------------------ */

function ServerErrorBanner({
  err, onResend,
}: { err: ServerError | null; onResend: (email: string) => Promise<void> }) {
  if (!err) return null;
  if (err.kind === "credentials") {
    return <InlineAlert tone="danger" icon={<AlertCircle size={14} />}>Email o contraseña incorrectos.</InlineAlert>;
  }
  if (err.kind === "unconfirmed") {
    return (
      <InlineAlert tone="warning" icon={<AlertCircle size={14} />}>
        Necesitás confirmar tu email antes de ingresar.{" "}
        <button
          onClick={() => onResend(err.email)}
          className="font-semibold underline"
        >
          Reenviar email de confirmación
        </button>
      </InlineAlert>
    );
  }
  if (err.kind === "banned") {
    return (
      <InlineAlert tone="danger" icon={<AlertCircle size={14} />}>
        Esta cuenta está suspendida. Si creés que es un error, escribí a soporte.
      </InlineAlert>
    );
  }
  return (
    <InlineAlert tone="danger" icon={<AlertCircle size={14} />}>
      Algo salió mal. Probá de nuevo en unos segundos.
    </InlineAlert>
  );
}
