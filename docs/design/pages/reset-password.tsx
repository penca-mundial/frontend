// app/(public)/reset-password/page.tsx
"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/button";
import { AuthCard, PasswordField, PasswordStrength } from "@/components/form";
import { PublicShell } from "../_shell";

/**
 * Reset password — el usuario llega desde el link del email con un token en la URL.
 * Estados:
 *  - no_token        → "Link inválido" + CTA a forgot-password
 *  - token_expired   → "Link ya no es válido" (después de submit con 400)
 *  - submitting      → loading
 *  - password_pwned  → error inline en el input
 *  - success         → redirect a /login?reset=success (donde mostramos un toast)
 */

const schema = z
  .object({
    password: z.string().min(8, "Mínimo 8 caracteres.").regex(/\d/, "Al menos 1 número."),
    password2: z.string(),
  })
  .refine((d) => d.password === d.password2, {
    message: "Las contraseñas no coinciden.",
    path: ["password2"],
  });
type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("reset_password_token");

  const [tokenInvalid, setTokenInvalid] = React.useState(false);
  const [pwError, setPwError] = React.useState<string | null>(null);

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onChange" });

  /* --- No token: link claramente roto --- */
  if (!token) {
    return (
      <PublicShell narrow>
        <InvalidTokenCard
          title="Link inválido"
          body="Este link parece roto. Pedí uno nuevo desde Recuperar contraseña."
        />
      </PublicShell>
    );
  }

  /* --- Token rejected por backend tras submit --- */
  if (tokenInvalid) {
    return (
      <PublicShell narrow>
        <InvalidTokenCard
          title="Este link ya no es válido"
          body="Suele expirar en unas horas. Pedí uno nuevo y probá de nuevo."
        />
      </PublicShell>
    );
  }

  const onSubmit = async (values: FormValues) => {
    setPwError(null);
    try {
      const res = await fetch("/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reset_password_token: token,
          password: values.password,
          password_confirmation: values.password2,
        }),
      });

      if (res.status === 400 || res.status === 410) { setTokenInvalid(true); return; }
      if (res.status === 422) {
        const body = await res.json();
        if (body.error === "pwned") {
          setPwError("Esta contraseña aparece en filtraciones públicas. Probá una más segura.");
          return;
        }
        setPwError("La contraseña no es válida.");
        return;
      }
      if (!res.ok) { setPwError("Algo salió mal. Probá de nuevo."); return; }

      router.push("/login?reset=success");
    } catch {
      setPwError("Algo salió mal. Probá de nuevo.");
    }
  };

  return (
    <PublicShell narrow>
      <AuthCard title="Elegí una contraseña nueva">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <PasswordField
            label="Contraseña nueva"
            value={watch("password") ?? ""}
            onChange={(v) => setValue("password", v, { shouldValidate: true })}
            error={errors.password?.message || pwError || undefined}
            hint="Mínimo 8 caracteres y al menos 1 número."
            autoComplete="new-password"
          />
          <PasswordStrength value={watch("password") ?? ""} />
          <PasswordField
            label="Repetí la contraseña"
            value={watch("password2") ?? ""}
            onChange={(v) => setValue("password2", v, { shouldValidate: true })}
            error={errors.password2?.message}
            autoComplete="new-password"
          />
          <Button
            type="submit" variant="primary" size="lg" fullWidth
            disabled={!isValid || isSubmitting}
            loading={isSubmitting}
          >
            {isSubmitting ? "Guardando…" : "Guardar contraseña"}
          </Button>
        </form>
      </AuthCard>
    </PublicShell>
  );
}

/* ------------------------------------------------------------------------ */

function InvalidTokenCard({ title, body }: { title: string; body: string }) {
  return (
    <AuthCard title={title} subtitle={body}>
      <div className="py-2 text-center">
        <div className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
          <AlertTriangle size={28} aria-hidden="true" />
        </div>
      </div>
      <Button variant="primary" size="lg" fullWidth asChild>
        <Link href="/forgot-password">Recuperar contraseña</Link>
      </Button>
    </AuthCard>
  );
}
