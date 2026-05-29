// app/(public)/signup/page.tsx
"use client";
import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/button";
import {
  AuthCard, Field, Input, PasswordField, PasswordStrength,
  GoogleBtn, OrDivider, InlineAlert,
} from "@/components/form";
import { PublicShell } from "../_shell";

/**
 * Signup — crear cuenta con email/username/password, o con Google.
 *
 * Estados:
 *  - idle/typing       → validación inline (Zod + check de regex de username)
 *  - submitting        → loading
 *  - email_taken       → error inline en el campo email con link a login
 *  - username_taken    → error inline en username
 *  - password_pwned    → error inline en password
 *  - success           → swap del card por la pantalla "Revisá tu email"
 */

const schema = z
  .object({
    email: z.string().min(1, "El email no puede estar vacío.").email("Esto no parece un email — falta el @ o el dominio."),
    username: z
      .string()
      .min(3, "Mínimo 3 caracteres.")
      .max(20, "Máximo 20 caracteres.")
      .regex(/^[a-z0-9_]+$/, "Solo letras minúsculas, números y _"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres.")
      .regex(/\d/, "Al menos 1 número."),
    password2: z.string(),
  })
  .refine((d) => d.password === d.password2, {
    message: "Las contraseñas no coinciden.",
    path: ["password2"],
  });
type FormValues = z.infer<typeof schema>;

type FieldError = { field: "email" | "username" | "password"; message: string };

export default function SignupPage() {
  const {
    register, handleSubmit, watch, setValue, setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onChange" });

  const [created, setCreated] = React.useState<{ email: string } | null>(null);
  const [serverErr, setServerErr] = React.useState<string | null>(null);

  const pwValue = watch("password") ?? "";

  const onSubmit = async (values: FormValues) => {
    setServerErr(null);
    try {
      const res = await fetch("/auth/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.status === 422) {
        const body = (await res.json()) as { fieldErrors?: FieldError[] };
        body.fieldErrors?.forEach((e) => setError(e.field, { type: "server", message: e.message }));
        return;
      }
      if (!res.ok) { setServerErr("Algo salió mal. Probá de nuevo en unos segundos."); return; }

      setCreated({ email: values.email });
    } catch {
      setServerErr("Algo salió mal. Probá de nuevo en unos segundos.");
    }
  };

  /* --- Estado: confirm-pending --- */
  if (created) {
    return (
      <PublicShell narrow>
        <ConfirmPending email={created.email} />
      </PublicShell>
    );
  }

  /* --- Estado: form --- */
  return (
    <PublicShell narrow>
      <AuthCard
        title="Crear cuenta"
        subtitle="Es gratis, sin tarjeta, sin spam."
        footer={
          <>
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="font-semibold text-brand-primary underline">
              Ingresar
            </Link>
          </>
        }
      >
        {serverErr && (
          <InlineAlert tone="danger" icon={<AlertCircle size={14} />}>
            {serverErr}
          </InlineAlert>
        )}

        <GoogleBtn
          label="Registrarme con Google"
          onClick={() => {
            const base = process.env.NEXT_PUBLIC_API_URL ?? "";
            window.location.href = `${base}/auth/google_oauth2`;
          }}
        />
        <OrDivider />

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Field
            label="Email"
            error={
              errors.email?.message ||
              (errors.email?.type === "server" && errors.email?.message) ||
              undefined
            }
            hint={
              errors.email?.type === "server" && errors.email?.message?.includes("ya tiene")
                ? undefined
                : undefined
            }
          >
            <Input
              type="email" autoComplete="email" placeholder="vos@ejemplo.com"
              disabled={isSubmitting}
              {...register("email")}
            />
          </Field>

          <Field
            label="Username"
            hint="Letras minúsculas, números y guion bajo. Entre 3 y 20 caracteres."
            error={errors.username?.message}
            valid={!errors.username && (watch("username") ?? "").length >= 3}
            prefix="@"
          >
            <Input
              autoComplete="username" placeholder="santi_2026"
              disabled={isSubmitting}
              {...register("username", {
                setValueAs: (v: string) => v.toLowerCase(),
              })}
            />
          </Field>

          <PasswordField
            label="Contraseña"
            value={pwValue}
            onChange={(v) => setValue("password", v, { shouldValidate: true })}
            error={errors.password?.message}
            hint="Mínimo 8 caracteres y al menos 1 número."
            autoComplete="new-password"
          />
          <PasswordStrength value={pwValue} />

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
            {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
          </Button>
        </form>
      </AuthCard>
    </PublicShell>
  );
}

/* ------------------------------------------------------------------------ */

function ConfirmPending({ email }: { email: string }) {
  const [resending, setResending] = React.useState(false);
  const [resent, setResent] = React.useState(false);

  const resend = async () => {
    setResending(true);
    try {
      await fetch("/auth/confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthCard title="¡Casi listo!">
      <div className="py-2 text-center">
        <div className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
          <Mail size={28} aria-hidden="true" />
        </div>
        <p className="text-sm leading-relaxed text-text-secondary">
          Te mandamos un mail a{" "}
          <strong className="text-text-primary">{email}</strong> con un link para confirmar
          tu cuenta. Mientras tanto, esta pantalla puede cerrarse.
        </p>
      </div>

      {resent && (
        <InlineAlert tone="success">
          Te lo mandamos de nuevo. Revisá la carpeta de spam.
        </InlineAlert>
      )}

      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <Button variant="secondary" size="md" onClick={resend} loading={resending}>
          ¿No te llegó? Reenviar email
        </Button>
        <Button variant="ghost" size="md" asChild>
          <Link href="/login">Volver al inicio</Link>
        </Button>
      </div>
    </AuthCard>
  );
}
