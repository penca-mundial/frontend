// components/button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Penca Mundial Button — preset Cancha
 *
 * Variantes (del UI spec):
 *  - primary       (default)
 *  - secondary
 *  - ghost
 *  - destructive
 *  - white         (para banders sobre fondo brand)
 *  - accent
 *
 * Tamaños: sm (32px) · md (40px) · lg (48px). En mobile el mínimo táctil es md.
 *
 * Icon a la izquierda (`icon`) y/o a la derecha (`iconRight`) — pasá un componente
 * de lucide-react, no un nodo. El size del icono se calcula del tamaño del botón.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-semibold rounded-[10px] border border-transparent",
    "transition-all duration-150 ease-out",
    "focus-visible:outline-2 focus-visible:outline-brand-primary focus-visible:outline-offset-2",
    "disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:     "bg-brand-primary text-white border-brand-primary hover:bg-brand-primary-hover",
        secondary:   "bg-surface text-text-primary border-border-strong hover:bg-surface-muted",
        ghost:       "bg-transparent text-text-primary hover:bg-surface-muted",
        destructive: "bg-danger text-white border-danger hover:brightness-95",
        white:       "bg-white text-brand-primary border-white hover:bg-surface-muted",
        accent:      "bg-brand-accent text-text-primary border-brand-accent hover:brightness-95",
        link:        "bg-transparent text-brand-primary underline-offset-4 hover:underline px-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-5 text-[15px]",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: { variant: "primary", size: "md", fullWidth: false },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Pasalo como `<Slot>` (shadcn pattern) si querés que el componente sea polimórfico (ej. <a>). */
  asChild?: boolean;
  /** Lucide icon component (no element). Ej: `icon={Check}` */
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  /** Loading state — muestra spinner + deshabilita */
  loading?: boolean;
}

const ICON_SIZE = { sm: 14, md: 16, lg: 18 } as const;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className, variant, size = "md", fullWidth,
      asChild, icon: Icon, iconRight: IconRight, loading,
      disabled, children, ...rest
    },
    ref
  ) => {
    const Comp: any = asChild ? Slot : "button";
    const iconSize = ICON_SIZE[size ?? "md"];

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={disabled || loading}
        {...rest}
      >
        {loading ? <Spinner size={iconSize} />
                 : Icon ? <Icon size={iconSize} aria-hidden="true" /> : null}
        {children}
        {!loading && IconRight ? <IconRight size={iconSize} aria-hidden="true" /> : null}
      </Comp>
    );
  }
);
Button.displayName = "Button";

function Spinner({ size }: { size: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      className="animate-spin" aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5"
              fill="none" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round" />
    </svg>
  );
}

export { buttonVariants };
