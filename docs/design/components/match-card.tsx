// components/match-card.tsx
import * as React from "react";
import { Check, X, Target, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/* ----------------------------------------------------------------------------
 * Tipos del dominio
 * -------------------------------------------------------------------------- */

export type MatchStatus = "scheduled" | "live" | "finished" | "postponed" | "cancelled";
export type MatchPhase =
  | "group_stage" | "r32" | "r16" | "qf" | "sf" | "third" | "final";

export interface Team {
  code3: string;          // "ARG", "USA"
  name: string;           // "Argentina"
  flag: string;           // URL del SVG/PNG de la bandera
}

export interface Match {
  id: string;
  home: Team;
  away: Team;
  group?: string;         // "A", "B"... — solo en group_stage
  phase: MatchPhase;
  kickoff: string;        // ISO
  stadium?: string;
  status: MatchStatus;
  minute?: number;        // si live
  scoreHome?: number;
  scoreAway?: number;
}

export type HitType = "exact" | "diff" | "winner" | "wrong" | "pending";

export interface Prediction {
  home: number;
  away: number;
  advancing?: string;     // code3 — solo en knockouts
  points: number | null;
  hitType: HitType;
}

/* ----------------------------------------------------------------------------
 * MatchCard — la card por defecto, usada en Fixture, Home, Mis pronósticos.
 *
 * Soporta los 4 estados visuales del spec:
 *  - default (scheduled, sin predicción)            → "Compact"
 *  - live (chip pulse rojo, border pulse)           → "Live"
 *  - finished con prediction.hitType === "exact"    → "Exact hit" (accent="success")
 *  - finished con prediction.hitType === "wrong"    → tinted rojo (accent="danger")
 *
 * El componente NO maneja el flujo de predicción: emite `onClick` y el padre
 * decide si abre el editor inline (desktop) o el bottom sheet (mobile).
 * -------------------------------------------------------------------------- */

export interface MatchCardProps extends React.HTMLAttributes<HTMLButtonElement> {
  match: Match;
  prediction?: Prediction;
  /** Tint sutil de fondo. Si no se pasa, se infiere del hitType cuando aplica. */
  accent?: "success" | "warning" | "danger" | null;
  hideStatus?: boolean;
}

export function MatchCard({
  match, prediction, accent, hideStatus, className, onClick, ...rest
}: MatchCardProps) {
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const hasScore = isLive || isFinished;

  const resolvedAccent =
    accent ??
    (prediction?.hitType === "exact" ? "success"
      : prediction?.hitType === "wrong" && isFinished ? "danger"
      : null);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group/match-card relative w-full text-left",
        "flex flex-col gap-2.5",
        "rounded-xl border bg-surface p-3.5",
        "shadow-sm transition-all duration-150 ease-out",
        "hover:shadow-md hover:-translate-y-px",
        "focus-visible:outline-2 focus-visible:outline-brand-primary focus-visible:outline-offset-2",
        // Border
        isLive
          ? "border-live/45 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]"
          : "border-border",
        // Accent backgrounds (subtle gradient top → surface)
        resolvedAccent === "success" && "bg-[linear-gradient(180deg,#F0FDF4_0%,#FFFFFF_60%)]",
        resolvedAccent === "warning" && "bg-[linear-gradient(180deg,#FEFCE8_0%,#FFFFFF_60%)]",
        resolvedAccent === "danger"  && "bg-[linear-gradient(180deg,#FEF2F2_0%,#FFFFFF_60%)]",
        className
      )}
      {...rest}
    >
      <CardHeader match={match} hideStatus={hideStatus} />

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5">
        <TeamLine team={match.home} align="left" score={hasScore ? match.scoreHome : undefined} />
        <span className="font-mono text-[11px] text-text-disabled">vs</span>
        <TeamLine team={match.away} align="right" score={hasScore ? match.scoreAway : undefined} />
      </div>

      {(prediction || (match.status === "scheduled" && !prediction)) && (
        <div className="flex items-center justify-between gap-2 border-t border-dashed border-border pt-2">
          {prediction ? (
            <PredictionChip prediction={prediction} />
          ) : (
            <span className="text-xs text-text-secondary">Sin pronóstico todavía</span>
          )}
          {!prediction && match.status === "scheduled" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary-soft px-2.5 py-1 text-[11px] font-semibold text-brand-primary-hover">
              <Target size={11} strokeWidth={2} />
              Predecir
            </span>
          )}
          {prediction?.hitType === "pending" && isLive && (
            <span className="rounded-full bg-warning-soft px-2.5 py-1 text-[11px] font-semibold text-[#854D0E]">
              A definir
            </span>
          )}
        </div>
      )}
    </button>
  );
}

/* --- Subcomponentes internos ---------------------------------------------- */

function CardHeader({ match, hideStatus }: { match: Match; hideStatus?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="font-semibold uppercase tracking-[0.12em] text-[10.5px] text-text-secondary">
          {phaseLabel(match)}
        </span>
        <span className="text-border-strong">·</span>
        <span className="text-[11.5px] font-medium text-text-secondary">
          {fmtTime(match.kickoff)}
        </span>
      </div>
      {!hideStatus && <StatusBadge match={match} />}
    </div>
  );
}

function StatusBadge({ match }: { match: Match }) {
  if (match.status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEE2E2] px-2.5 py-1 text-[10.5px] font-semibold text-[#991B1B]">
        <span className="size-1.5 rounded-full bg-live animate-[pm-pulse_1.2s_ease-in-out_infinite]" />
        EN VIVO · {match.minute}'
      </span>
    );
  }
  if (match.status === "finished") {
    return (
      <span className="rounded-full bg-success-soft px-2.5 py-1 text-[10.5px] font-semibold text-[#166534]">
        FINAL
      </span>
    );
  }
  return (
    <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[10.5px] font-semibold text-text-secondary">
      {fmtTime(match.kickoff).replace(":", "h")}
    </span>
  );
}

function TeamLine({
  team, align, score,
}: { team: Team; align: "left" | "right"; score?: number }) {
  const isRight = align === "right";
  return (
    <div className={cn("flex items-center gap-2", isRight && "flex-row-reverse")}>
      <Flag team={team} size={26} />
      <div className={cn("min-w-0 flex-1", isRight ? "text-right" : "text-left")}>
        <div className="truncate text-sm font-semibold leading-tight">
          {team.name}
        </div>
        {score != null && (
          <div className="mt-0.5 font-display text-[22px] font-bold leading-none tabular-nums text-text-primary">
            {score}
          </div>
        )}
      </div>
    </div>
  );
}

export function Flag({ team, size = 24 }: { team: Team; size?: number }) {
  const h = Math.round(size * 0.7);
  return (
    <span
      className="inline-flex shrink-0 overflow-hidden rounded-[3px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] bg-surface-muted"
      style={{ width: size, height: h }}
    >
      <img src={team.flag} alt="" className="size-full object-cover block" />
    </span>
  );
}

export function PredictionChip({ prediction }: { prediction: Prediction }) {
  const tones: Record<HitType, { bg: string; fg: string; icon: React.ReactNode | null; label: string }> = {
    exact:   { bg: "bg-success-soft", fg: "text-[#166534]", icon: <Check size={11} strokeWidth={2.5} />, label: "Exacto" },
    diff:    { bg: "bg-warning-soft", fg: "text-[#854D0E]", icon: null, label: "Diferencia" },
    winner:  { bg: "bg-brand-accent-soft", fg: "text-[#92400E]", icon: null, label: "Ganador" },
    wrong:   { bg: "bg-danger-soft", fg: "text-[#991B1B]", icon: <X size={11} strokeWidth={2.5} />, label: "Errado" },
    pending: { bg: "bg-surface-muted", fg: "text-text-secondary", icon: null, label: "Pendiente" },
  };
  const t = tones[prediction.hitType];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap", t.bg, t.fg)}>
      {t.icon}
      Tu pronóstico {prediction.home}–{prediction.away}
      {prediction.points != null && ` · ${prediction.points} pts`}
    </span>
  );
}

/* ----------------------------------------------------------------------------
 * EditorialMatchCard — variante D del canvas.
 * Score gigante centrado, sin botones, sin chips. Para hero / resumen estático.
 * -------------------------------------------------------------------------- */
export interface EditorialMatchCardProps {
  match: Match;
  prediction?: Prediction;
  hitChipLabel?: string;     // override del label de hit
  className?: string;
}

export function EditorialMatchCard({ match, prediction, hitChipLabel, className }: EditorialMatchCardProps) {
  const isFinished = match.status === "finished";
  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-5", className)}>
      <div className="mb-3.5 flex justify-between">
        {prediction?.hitType === "exact" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-[#166534] whitespace-nowrap">
            <Check size={11} strokeWidth={2.5} />
            {hitChipLabel ?? `EXACTO · ${prediction.points ?? 10} pts`}
          </span>
        )}
        <span className="font-mono text-[11px] text-text-disabled ml-auto">
          {phaseLabel(match).toUpperCase()} · {fmtShortDate(match.kickoff)}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="text-left">
          <Flag team={match.home} size={32} />
          <div className="mt-1.5 font-mono text-[11px] font-semibold text-text-secondary">
            {match.home.code3}
          </div>
        </div>

        <div className="text-center font-display text-5xl font-extrabold leading-none tracking-[-0.03em] tabular-nums text-text-primary">
          {match.scoreHome ?? "–"}
          <span className="mx-1.5 text-text-disabled">–</span>
          {match.scoreAway ?? "–"}
        </div>

        <div className="text-right">
          <Flag team={match.away} size={32} />
          <div className="mt-1.5 font-mono text-[11px] font-semibold text-text-secondary">
            {match.away.code3}
          </div>
        </div>
      </div>

      {prediction && isFinished && (
        <div className="mt-3.5 flex justify-between border-t border-dashed border-border pt-3 text-xs text-text-secondary">
          <span>Tu pronóstico</span>
          <span className="font-mono font-semibold text-text-primary">
            {prediction.home}–{prediction.away}
          </span>
        </div>
      )}
    </div>
  );
}

/* --- Helpers --------------------------------------------------------------- */

function phaseLabel(match: Match) {
  if (match.phase === "group_stage" && match.group) return `Grupo ${match.group}`;
  return ({
    r32: "Dieciseisavos", r16: "Octavos", qf: "Cuartos",
    sf: "Semis", third: "3er puesto", final: "Final",
    group_stage: "Grupos",
  } as const)[match.phase] ?? "—";
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  // Usá una utilidad propia que respete el timezone del usuario.
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function fmtShortDate(iso: string) {
  const d = new Date(iso);
  const MONTHS = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
