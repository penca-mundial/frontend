// components/prediction-sheet.tsx
import * as React from "react";
import { Minus, Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./button";
import { Flag, type Match, type Prediction, type Team } from "./match-card";

// shadcn's Sheet primitive (Radix Dialog under the hood).
// npx shadcn-ui@latest add sheet
import {
  Sheet, SheetContent, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";

/* ----------------------------------------------------------------------------
 * PredictionSheet — bottom sheet (mobile) / centered dialog (desktop) que
 * envuelve un <PredictionEditor>.
 *
 * Controlado: el padre maneja `open` y `onOpenChange`. Esto evita acoplarlo
 * a un context global y permite usarlo desde donde quieras (Fixture row,
 * NextMatchCard del Home, etc.).
 *
 * Uso:
 *   <PredictionSheet
 *     match={match}
 *     initial={myPrediction}
 *     open={isPredicting}
 *     onOpenChange={setIsPredicting}
 *     onSave={async (p) => { await api.savePrediction(match.id, p); }}
 *   />
 * -------------------------------------------------------------------------- */

export interface PredictionSheetProps {
  match: Match;
  initial?: Prediction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Async — el sheet maneja el loading + cerrar en éxito */
  onSave: (next: PredictionInput) => Promise<void> | void;
}

export interface PredictionInput {
  home: number;
  away: number;
  advancing?: string;
}

export function PredictionSheet({ match, initial, open, onOpenChange, onSave }: PredictionSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          // Bottom sheet en mobile, centered card en md+
          "bg-surface p-0 border-0 rounded-t-[20px]",
          "shadow-[0_-12px_32px_rgba(0,0,0,0.18)]",
          "pb-[max(12px,env(safe-area-inset-bottom))]",
          "md:rounded-2xl md:max-w-md md:mx-auto md:mb-auto md:mt-[20vh]",
          "md:shadow-lg md:border md:border-border",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
        )}
      >
        {/* Visually-only drag handle (mobile). En md+ no aporta. */}
        <div className="flex justify-center pt-2 pb-1 md:hidden" aria-hidden="true">
          <div className="h-1 w-9 rounded-sm bg-border-strong" />
        </div>

        {/* shadcn requires SheetTitle/Description for accessibility. */}
        <SheetTitle className="sr-only">Editar pronóstico</SheetTitle>
        <SheetDescription className="sr-only">
          {match.home.name} contra {match.away.name}
        </SheetDescription>

        <PredictionEditor
          match={match}
          initial={initial}
          onSave={onSave}
          onCancel={() => onOpenChange(false)}
          variant="sheet"
        />
      </SheetContent>
    </Sheet>
  );
}

/* ----------------------------------------------------------------------------
 * PredictionEditor — el editor en sí.
 *
 * Se usa también inline (sin sheet) cuando un row del fixture expande hacia
 * abajo en desktop. Le pasás `variant="inline"`.
 * -------------------------------------------------------------------------- */

export interface PredictionEditorProps {
  match: Match;
  initial?: Prediction;
  onSave: (next: PredictionInput) => Promise<void> | void;
  onCancel: () => void;
  variant?: "sheet" | "inline";
}

export function PredictionEditor({
  match, initial, onSave, onCancel, variant = "inline",
}: PredictionEditorProps) {
  const [home, setHome] = React.useState(initial?.home ?? 0);
  const [away, setAway] = React.useState(initial?.away ?? 0);
  const [advancing, setAdvancing] = React.useState<string | null>(initial?.advancing ?? null);
  const [saving, setSaving] = React.useState(false);

  const isKO = match.phase !== "group_stage";
  const dirty =
    !initial ||
    home !== initial.home ||
    away !== initial.away ||
    (isKO && advancing !== initial.advancing);
  const ok = (!isKO || advancing) && dirty && !saving;

  const handleSave = async () => {
    if (!ok) return;
    setSaving(true);
    try {
      await onSave({ home, away, advancing: advancing ?? undefined });
    } finally {
      setSaving(false);
    }
  };

  const isSheet = variant === "sheet";

  return (
    <div className={cn(isSheet ? "px-4.5 pb-4.5" : "px-4 pt-2 pb-4")}>
      {isSheet && (
        <div className="mb-3.5 flex items-center justify-between border-b border-border pb-3">
          <div>
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
              Tu pronóstico
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[13.5px] font-semibold">
              <Flag team={match.home} size={16} />
              <span>{match.home.code3}</span>
              <span className="text-text-disabled">vs</span>
              <span>{match.away.code3}</span>
              <Flag team={match.away} size={16} />
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cerrar"
            className="inline-flex size-8 items-center justify-center rounded-lg bg-surface-muted"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {!isSheet && (
        <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
          Tu pronóstico
        </div>
      )}

      {/* Steppers */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl bg-surface-muted p-3.5">
        <Stepper team={match.home} value={home} onChange={setHome} />
        <span className="px-1 font-display text-2xl font-extrabold leading-none text-text-disabled">
          –
        </span>
        <Stepper team={match.away} value={away} onChange={setAway} />
      </div>

      {/* Advancing (KO) */}
      {isKO && (
        <div className="mt-3.5">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-text-secondary">
            Quién pasa de ronda
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[match.home, match.away].map((t) => {
              const active = advancing === t.code3;
              return (
                <button
                  key={t.code3}
                  type="button"
                  onClick={() => setAdvancing(t.code3)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-[10px] border-[1.5px] px-3 py-2.5 text-sm font-semibold",
                    active
                      ? "border-brand-primary bg-brand-primary-soft text-brand-primary-hover"
                      : "border-border bg-surface text-text-primary",
                  )}
                >
                  <Flag team={t} size={16} />
                  {t.code3}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-3.5 flex justify-end gap-2">
        <Button
          variant="ghost"
          size={isSheet ? "md" : "sm"}
          onClick={onCancel}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          size={isSheet ? "md" : "sm"}
          onClick={handleSave}
          disabled={!ok}
          loading={saving}
          icon={saving ? undefined : Check}
        >
          {saving ? "Guardando…" : "Guardar pronóstico"}
        </Button>
      </div>
    </div>
  );
}

/* --- Stepper internal ------------------------------------------- */

function Stepper({
  team, value, onChange,
}: {
  team: Team;
  value: number;
  onChange: (n: number) => void;
}) {
  // Keyboard: ArrowUp/ArrowDown when number is focused.
  const numberRef = React.useRef<HTMLDivElement>(null);
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp")   { onChange(Math.min(20, value + 1)); e.preventDefault(); }
    if (e.key === "ArrowDown") { onChange(Math.max(0,  value - 1)); e.preventDefault(); }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-col items-center gap-0.5">
        <Flag team={team} size={24} />
        <span className="font-mono text-[10px] font-semibold text-text-secondary">
          {team.code3}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <StepBtn icon={Minus} onClick={() => onChange(Math.max(0, value - 1))} ariaLabel={`Menos un gol para ${team.name}`} />
        <div
          ref={numberRef}
          role="spinbutton"
          tabIndex={0}
          aria-valuemin={0}
          aria-valuemax={20}
          aria-valuenow={value}
          aria-label={`Goles de ${team.name}`}
          onKeyDown={onKeyDown}
          className="min-w-[44px] text-center font-display text-[32px] font-extrabold leading-none tracking-tight tabular-nums text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-md"
        >
          {value}
        </div>
        <StepBtn icon={Plus} onClick={() => onChange(Math.min(20, value + 1))} ariaLabel={`Más un gol para ${team.name}`} />
      </div>
    </div>
  );
}

function StepBtn({
  icon: Icon, onClick, ariaLabel,
}: {
  icon: typeof Plus;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="inline-flex size-8 items-center justify-center rounded-[9px] border border-border bg-surface text-text-primary hover:bg-surface-muted active:scale-95 transition-transform"
    >
      <Icon size={14} strokeWidth={2.5} />
    </button>
  );
}
