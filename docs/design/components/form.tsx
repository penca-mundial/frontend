// components/form.tsx
import * as React from "react";
import { AlertCircle, Check, Eye, EyeOff, Info } from "lucide-react";
import { cn } from "@/lib/cn";

/* ----------------------------------------------------------------------------
 * Primitivas de formulario — diseñadas para integrarse con react-hook-form + zod.
 * Cada componente acepta `error: string | undefined` (mensaje) y `valid: boolean`
 * para mostrar validación en vivo. No depende de RHF directamente: lo conectás
 * desde afuera.
 * -------------------------------------------------------------------------- */

/* --- Field: label + container ----------------------------------- */

export interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  valid?: boolean;
  /** Slot a la derecha del label (ej. link "¿Olvidaste tu contraseña?") */
  right?: React.ReactNode;
  /** Prefijo dentro del input (ej. "@" para username) */
  prefix?: string;
  /** El input/textarea/select va como children */
  children: React.ReactNode;
  /** Para asociar con aria-describedby */
  id?: string;
  className?: string;
}

export function Field({
  label, hint, error, valid, right, prefix, children, id, className,
}: FieldProps) {
  const reactId = React.useId();
  const fid = id ?? reactId;
  const describedBy: string[] = [];
  if (hint && !error) describedBy.push(`${fid}-hint`);
  if (error) describedBy.push(`${fid}-error`);

  return (
    <div className={cn("mb-3.5", className)}>
      <div className="flex justify-between items-baseline mb-1.5">
        <label htmlFor={fid} className="text-[12.5px] font-semibold text-text-primary">
          {label}
        </label>
        {right}
      </div>

      <div
        className={cn(
          "flex items-center overflow-hidden rounded-[10px] border bg-surface transition-colors",
          error ? "border-danger" : valid ? "border-success" : "border-border",
          "focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/15"
        )}
      >
        {prefix && (
          <span className="pl-3 font-mono text-sm text-text-disabled">{prefix}</span>
        )}

        {/* Inyectar id + aria-describedby al primer hijo si es un control */}
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<any>, {
              id: (children.props as any).id ?? fid,
              "aria-describedby": describedBy.join(" ") || undefined,
              "aria-invalid": Boolean(error) || undefined,
            })
          : children}

        {valid && !error && (
          <span className="px-3 text-success" aria-hidden="true">
            <Check size={16} strokeWidth={2.5} />
          </span>
        )}
      </div>

      {hint && !error && (
        <p id={`${fid}-hint`} className="mt-1.5 text-[11.5px] leading-snug text-text-secondary">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${fid}-error`} role="alert"
          className="mt-1.5 inline-flex items-center gap-1.5 text-[11.5px] leading-snug text-danger"
        >
          <AlertCircle size={11} strokeWidth={2} />
          {error}
        </p>
      )}
    </div>
  );
}

/* --- Input: el control base ------------------------------------- */
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => (
    <input
      ref={ref}
      className={cn(
        "min-w-0 flex-1 h-[42px] border-none bg-transparent px-3 text-sm font-sans text-text-primary outline-none placeholder:text-text-disabled disabled:opacity-50",
        className
      )}
      {...rest}
    />
  )
);
Input.displayName = "Input";

/* --- Textarea (counter opcional) -------------------------------- */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...rest }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-w-0 flex-1 min-h-[88px] resize-y border-none bg-transparent px-3 py-2.5 text-sm font-sans text-text-primary outline-none placeholder:text-text-disabled",
        className
      )}
      {...rest}
    />
  )
);
Textarea.displayName = "Textarea";

/* --- PasswordField (con toggle show/hide) ----------------------- */
export interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  error?: string;
  autoComplete?: "current-password" | "new-password";
  id?: string;
}

export function PasswordField({
  label, value, onChange, hint, error, autoComplete = "current-password", id,
}: PasswordFieldProps) {
  const [show, setShow] = React.useState(false);
  return (
    <Field label={label} hint={hint} error={error} id={id}>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={show ? "" : "••••••••"}
        className="min-w-0 flex-1 h-[42px] border-none bg-transparent px-3 text-sm font-sans text-text-primary outline-none placeholder:text-text-disabled"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="inline-flex items-center px-3 text-text-disabled hover:text-text-secondary"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </Field>
  );
}

/* --- PasswordStrength: barra de 3 segmentos --------------------- */
export function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;
  const checks = {
    len: value.length >= 8,
    num: /\d/.test(value),
    mix: /[a-z]/.test(value) && /[A-Z]/.test(value),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const labelMap = ["", "débil", "ok", "fuerte"];
  const colorMap = ["text-border-strong", "text-danger", "text-warning", "text-success"];

  return (
    <div className="-mt-2 mb-3.5 flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded transition-colors",
              i < score
                ? score === 1 ? "bg-danger"
                : score === 2 ? "bg-warning"
                : "bg-success"
                : "bg-surface-muted"
            )}
          />
        ))}
      </div>
      <span className={cn("text-[10.5px] font-semibold font-mono", colorMap[score])}>
        {labelMap[score]}
      </span>
    </div>
  );
}

/* --- GoogleBtn -------------------------------------------------- */
export function GoogleBtn({
  onClick, label = "Continuar con Google", disabled,
}: { onClick: () => void; label?: string; disabled?: boolean }) {
  return (
    <button
      type="button" onClick={onClick} disabled={disabled}
      className="inline-flex h-[46px] w-full items-center justify-center gap-2.5 rounded-[10px] border border-border-strong bg-surface text-sm font-semibold text-text-primary hover:bg-surface-muted disabled:opacity-60"
    >
      <GoogleIcon />
      {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.7-6.2 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3c-2 1.5-4.5 2.4-7.4 2.4-5.1 0-9.5-3.3-11.2-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.3 5.3c-.4.4 6.6-4.8 6.6-15 0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

/* --- OrDivider -------------------------------------------------- */
export function OrDivider({ label = "o con email" }: { label?: string }) {
  return (
    <div className="my-4 flex items-center gap-3 text-text-disabled">
      <span className="h-px flex-1 bg-border" />
      <span className="whitespace-nowrap font-mono text-[11px]">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

/* --- InlineAlert ------------------------------------------------ */
export type AlertTone = "info" | "success" | "warning" | "danger";

const ALERT_STYLES: Record<AlertTone, { bg: string; border: string; fg: string }> = {
  info:    { bg: "bg-[#EFF6FF]",        border: "border-[#BFDBFE]", fg: "text-[#1E40AF]" },
  success: { bg: "bg-success-soft",     border: "border-[#A7F3D0]", fg: "text-[#065F46]" },
  warning: { bg: "bg-warning-soft",     border: "border-[#FDE68A]", fg: "text-[#854D0E]" },
  danger:  { bg: "bg-danger-soft",      border: "border-[#FCA5A5]", fg: "text-[#991B1B]" },
};

export function InlineAlert({
  tone = "info", icon, children, className,
}: {
  tone?: AlertTone;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const s = ALERT_STYLES[tone];
  return (
    <div
      className={cn(
        "mb-3.5 flex items-start gap-2.5 rounded-[10px] border px-3.5 py-2.5 text-[12.5px] leading-relaxed",
        s.bg, s.border, s.fg, className,
      )}
      role={tone === "danger" ? "alert" : "status"}
    >
      <span className="mt-0.5 shrink-0" aria-hidden="true">
        {icon ?? <Info size={14} strokeWidth={2} />}
      </span>
      <div>{children}</div>
    </div>
  );
}

/* --- AuthCard (shell para login/signup) ------------------------- */
export interface AuthCardProps {
  title: string;
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function AuthCard({ title, subtitle, footer, children }: AuthCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-7 shadow-sm">
      <div className="mb-5.5">
        <h1 className="font-display text-[28px] font-bold leading-tight tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-text-secondary">{subtitle}</p>
        )}
      </div>
      {children}
      {footer && (
        <div className="mt-4.5 border-t border-border pt-4 text-center text-[12.5px] text-text-secondary">
          {footer}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * EJEMPLO de uso — Login form completo con react-hook-form + zod.
 * No es exportable, sólo de referencia. Copiá adentro de tu LoginPage.
 * --------------------------------------------------------------------------

  import { useForm } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { z } from "zod";

  const loginSchema = z.object({
    email: z.string().email("Esto no parece un email."),
    password: z.string().min(1, "La contraseña no puede estar vacía."),
  });
  type LoginValues = z.infer<typeof loginSchema>;

  function LoginForm({ onSubmit }: { onSubmit: (v: LoginValues) => Promise<void> }) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
      resolver: zodResolver(loginSchema),
      mode: "onBlur",
    });

    return (
      <AuthCard
        title="Bienvenido de vuelta"
        subtitle="Ingresá con tu email o con Google."
        footer={<>¿Todavía no tenés cuenta? <Link to="/signup" className="link">Crear cuenta</Link></>}
      >
        <GoogleBtn onClick={() => (location.href = `${API}/auth/google_oauth2`)} />
        <OrDivider />
        <form onSubmit={handleSubmit(onSubmit)} aria-label="Iniciar sesión">
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" autoComplete="email" placeholder="vos@ejemplo.com" {...register("email")} />
          </Field>
          <PasswordField
            label="Contraseña"
            value={watch("password") ?? ""}
            onChange={(v) => setValue("password", v)}
            error={errors.password?.message}
            autoComplete="current-password"
          />
          <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
            {isSubmitting ? "Ingresando…" : "Ingresar"}
          </Button>
        </form>
      </AuthCard>
    );
  }
*/
