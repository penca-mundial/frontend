// app/(public)/confirm-email/page.tsx
"use client";
import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/button";
import { AuthCard, Field, Input, InlineAlert } from "@/components/form";
import { PublicShell } from "../_shell";

/**
 * Confirm email — pantalla de feedback al volver del link en el email.
 * URL esperada: /confirm-email?status=success | invalid | pending
 *
 * Estados:
 *  - pending  → skeleton/spinner (raro — solo si el backend tarda)
 *  - success  → check verde + CTA a login
 *  - invalid  → alerta + form para reenviar
 */

const schema = z.object({
  email: z.string().email("Esto no parece un email."),
});
type FormValues = z.infer<typeof schema>;

export default function ConfirmEmailPage() {
  const params = useSearchParams();
  const status = (params.get("status") as "success" | "invalid" | "pending" | null) ?? "success";

  if (status === "pending") {
    return (
      <PublicShell narrow>
        <AuthCard title="Confirmando…" subtitle="Estamos validando tu email. No cierres esta pantalla.">
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        </AuthCard>
      </PublicShell>
    );
  }

  if (status === "invalid") {
    return (
      <PublicShell narrow>
        <InvalidStatus />
      </PublicShell>
    );
  }

  return (
    <PublicShell narrow>
      <AuthCard title="Email confirmado" subtitle="Ya podés ingresar con tu cuenta.">
        <div className="py-2 text-center">
          <div className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
            <Check size={28} strokeWidth={2.5} aria-hidden="true" />
          </div>
        </div>
        <Button variant="primary" size="lg" fullWidth asChild>
          <Link href="/login">Ingresar</Link>
        </Button>
      </AuthCard>
    </PublicShell>
  );
}

/* ------------------------------------------------------------------------ */

function InvalidStatus() {
  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onBlur" });
  const [resent, setResent] = React.useState(false);

  const onSubmit = async (values: FormValues) => {
    try {
      await fetch("/auth/confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });
      setResent(true);
    } catch {
      // ignore — UX no debe leak.
      setResent(true);
    }
  };

  if (resent) {
    return (
      <AuthCard title="Listo, te lo mandamos." subtitle="Revisá tu inbox y la carpeta de spam.">
        <Button variant="ghost" size="md" fullWidth asChild>
          <Link href="/login">Volver al inicio</Link>
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Link inválido"
      subtitle="Este link puede ser viejo o ya haber sido usado. Si todavía no confirmaste, te mandamos uno nuevo."
    >
      <div className="py-2 text-center">
        <div className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
          <AlertCircle size={28} aria-hidden="true" />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Tu email" error={errors.email?.message}>
          <Input
            type="email" autoComplete="email" placeholder="vos@ejemplo.com"
            {...register("email")}
          />
        </Field>
        <Button
          type="submit" variant="secondary" size="lg" fullWidth
          loading={isSubmitting}
        >
          Reenviar email de confirmación
        </Button>
      </form>
    </AuthCard>
  );
}

function Spinner() {
  return (
    <svg width={36} height={36} viewBox="0 0 24 24" className="animate-spin text-brand-primary">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5"
              fill="none" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round" />
    </svg>
  );
}
