// app/onboarding/username/page.tsx
"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/button";
import { AuthCard, Field, Input, InlineAlert } from "@/components/form";
import { PublicShell } from "../../(public)/_shell";

/**
 * Choose username — gate para usuarios autenticados sin username.
 *
 * Caso típico: usuario hizo signup con Google. El backend devuelve
 * needs_username:true y el frontend lo manda acá. Esta pantalla es
 * BLOQUEANTE: si intenta navegar a otra ruta /app/* sin tener username,
 * el guard lo trae acá de vuelta.
 *
 * Pre-requisito: este componente se monta dentro de un layout que ya
 * cargó el usuario actual (useAuth().user) — si ya tiene username,
 * redirigir a /app/home en useEffect.
 */

const schema = z.object({
  username: z
    .string()
    .min(3, "Mínimo 3 caracteres.")
    .max(20, "Máximo 20 caracteres.")
    .regex(/^[a-z0-9_]+$/, "Solo letras minúsculas, números y _"),
});
type FormValues = z.infer<typeof schema>;

interface AuthUser {
  email: string;
  avatarUrl?: string | null;
  username: string | null;
}

export default function ChooseUsernamePage() {
  const router = useRouter();
  const user = useCurrentUser(); // implementá según tu auth store

  // Si ya tiene username, fuera de acá.
  React.useEffect(() => {
    if (user?.username) router.replace("/app/home");
  }, [user, router]);

  const {
    register, handleSubmit, watch, setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onChange" });

  const username = watch("username") ?? "";
  const valid = !errors.username && username.length >= 3;

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await fetch("/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: values.username }),
      });

      if (res.status === 409) {
        setError("username", { type: "server", message: "Ese username ya está tomado. Probá otro." });
        return;
      }
      if (!res.ok) {
        setError("username", { type: "server", message: "No pudimos guardarlo. Probá de nuevo." });
        return;
      }
      router.replace("/app/home");
    } catch {
      setError("username", { type: "server", message: "No pudimos guardarlo. Probá de nuevo." });
    }
  };

  if (!user) {
    return (
      <PublicShell narrow>
        <AuthCard title="Cargando…" />
      </PublicShell>
    );
  }

  return (
    <PublicShell narrow>
      <AuthCard
        title="Elegí tu username"
        subtitle="Es como te van a ver el resto de jugadores. Después podés cambiarlo desde tu perfil."
      >
        {/* Google profile preview */}
        <div className="mb-5 flex items-center gap-3 rounded-[10px] border border-border bg-surface-muted px-3.5 py-2.5">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl} alt=""
              className="size-9 rounded-full object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="inline-flex size-9 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #4285F4 0%, #34A853 100%)" }}
            >
              {user.email[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] font-semibold">Conectado con Google</div>
            <div className="truncate text-[11.5px] text-text-secondary">{user.email}</div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-[#166534]">
            <Check size={11} strokeWidth={2.5} />
            Verificado
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Field
            label="Username"
            hint="Letras minúsculas, números y guion bajo. Entre 3 y 20 caracteres."
            error={errors.username?.message}
            valid={valid}
            prefix="@"
          >
            <Input
              autoFocus placeholder="santi_2026"
              disabled={isSubmitting}
              {...register("username", {
                setValueAs: (v: string) => v.toLowerCase(),
              })}
            />
          </Field>

          {valid && (
            <p className="mb-3.5 -mt-2 inline-flex items-center gap-1.5 text-xs text-success">
              <Check size={12} strokeWidth={2.5} />
              @{username} está disponible
            </p>
          )}

          <Button
            type="submit" variant="primary" size="lg" fullWidth
            iconRight={ArrowRight}
            disabled={!isValid || isSubmitting}
            loading={isSubmitting}
          >
            {isSubmitting ? "Guardando…" : "Continuar"}
          </Button>
        </form>

        <InlineAlert tone="info" className="mt-4 mb-0">
          Para usar la app necesitás elegir un username. Es un paso bloqueante.
        </InlineAlert>
      </AuthCard>
    </PublicShell>
  );
}

/* ------------------------------------------------------------------------ */
/* Stub — reemplazá por tu hook de auth real (Zustand/Context/SWR). */
function useCurrentUser(): AuthUser | null {
  // const { data } = useSWR<AuthUser>("/auth/me", fetcher);
  // return data ?? null;
  return null;
}
