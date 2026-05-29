// app/(public)/forgot-password/page.tsx
"use client";
import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail } from "lucide-react";
import { Button } from "@/components/button";
import { AuthCard, Field, Input, InlineAlert } from "@/components/form";
import { PublicShell } from "../_shell";

/**
 * Forgot password — pide el email, dispara el envío del link de reset.
 *
 * Decisión importante de seguridad: el backend devuelve 202 (Accepted) SIEMPRE,
 * exista o no el email, para evitar enumeración. La UI NO debe leak información:
 * siempre muestra el mismo mensaje de success.
 */

const schema = z.object({
  email: z.string().min(1, "El email no puede estar vacío.").email("Esto no parece un email."),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const {
    register, handleSubmit, getValues,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onChange" });

  const [sent, setSent] = React.useState(false);

  const onSubmit = async (values: FormValues) => {
    try {
      await fetch("/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });
    } catch {
      // Igual: siempre mostramos éxito (no leakeamos si falló por red u otro motivo).
    } finally {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <PublicShell narrow>
        <AuthCard title="Revisá tu inbox.">
          <div className="py-2 text-center">
            <div className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
              <Mail size={28} aria-hidden="true" />
            </div>
            <p className="text-sm leading-relaxed text-text-secondary">
              Si <strong className="text-text-primary">{getValues("email")}</strong> está
              registrado, vas a recibir un mail con instrucciones en los próximos minutos.
            </p>
          </div>
          <InlineAlert tone="info">
            No mostramos si el email existe por seguridad. Si no tenés cuenta, no vas a recibir nada.
          </InlineAlert>
          <Button variant="ghost" size="md" fullWidth asChild>
            <Link href="/login">Volver al inicio</Link>
          </Button>
        </AuthCard>
      </PublicShell>
    );
  }

  return (
    <PublicShell narrow>
      <AuthCard
        title="Recuperá tu contraseña"
        subtitle="Te mandamos un link a tu email para que la cambies."
        footer={
          <>
            ¿Te acordaste?{" "}
            <Link href="/login" className="font-semibold text-brand-primary underline">
              Volver a ingresar
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Field label="Email" error={errors.email?.message}>
            <Input
              type="email" autoComplete="email" placeholder="vos@ejemplo.com" autoFocus
              disabled={isSubmitting}
              {...register("email")}
            />
          </Field>
          <Button
            type="submit" variant="primary" size="lg" fullWidth
            disabled={!isValid || isSubmitting}
            loading={isSubmitting}
          >
            {isSubmitting ? "Enviando…" : "Mandar link de recuperación"}
          </Button>
        </form>
      </AuthCard>
    </PublicShell>
  );
}
