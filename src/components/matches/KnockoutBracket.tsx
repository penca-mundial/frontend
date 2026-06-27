import * as React from 'react'
import { ChevronLeft, ChevronRight, Info, Target } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/cn'

/* ============================================================================
 * KnockoutBracket — cuadro de eliminación tipo "cámara continua" (Claude Design).
 *
 * - Tablero único: las rondas son columnas conectadas por líneas (SVG elbows).
 * - Navegación tipo cámara: flechas / pager / wheel horizontal panean el viewport
 *   (translateX) sin desmontar nada. Ronda activa centrada, vecinas asomando.
 * - Resalta el camino del enfrentamiento enfocado (ancestros + descendientes).
 * - Card de 3er puesto suelta bajo la final, sin conectores.
 * - Solo lectura. (Predecir se hace en la vista de lista — el Calendario.)
 *
 * Señal de pronóstico (Penca): cada slot puede marcar `isAdvancing` (el que
 * avanzó, en negrita) y `pickOutcome` (verde acerté / rojo erré el avance). El
 * adaptador (`toKnockoutBracket`) las computa; el componente sólo las pinta.
 * ========================================================================== */

export interface BracketTeam {
  code3: string
  name: string
  flag: string // URL de la bandera ('' si no hay)
  /** El equipo que efectivamente avanzó (negrita). */
  isAdvancing?: boolean
  /** Si este equipo es MI pick de avance (fila amber hasta que se juega). */
  isMyAdvancer?: boolean
  /** Si este equipo es MI pick de avance: verde/rojo una vez jugado; null si no. */
  pickOutcome?: 'correct' | 'incorrect' | null
  /** Marcador a mostrar a la derecha (real o pronosticado). null/undefined → code3. */
  score?: number | null
}

export interface BracketMatch {
  id: string
  /** Equipo ya definido, o null si depende de una ronda previa. */
  home: BracketTeam | null
  away: BracketTeam | null
  /** Texto placeholder cuando el equipo no está definido (ej. "1º Grupo A"). */
  homeLabel?: string
  awayLabel?: string
  kickoff: string // ISO
  /** ids de los 2 matches de la ronda previa que alimentan a este. null en 1ª ronda. */
  feeds?: [string, string] | null
  /** Si el marcador mostrado es el resultado REAL o MI pronóstico. Pinta el tinte + tag. */
  scoreKind?: 'real' | 'predicted' | null
  /** Cruce real, abierto y NO locked → se puede pronosticar desde el cuadro. */
  predictable?: boolean
}

export interface BracketRound {
  key: string
  label: string // "Octavos"
  short: string // "8vos" (mobile)
  matches: BracketMatch[]
}

export interface KnockoutBracketProps {
  rounds: BracketRound[] // de izquierda (1ª ronda) a derecha (final)
  thirdPlace?: BracketMatch | null // card suelta bajo la final
  className?: string
  /** Formateador de fecha (default: dd mmm). */
  formatDate?: (iso: string) => string
  /**
   * Mobile: abre el pronóstico (un sheet, manejado afuera) para un cruce
   * predecible. El botón sólo aparece en el nodo enfocado y predecible.
   */
  onPredict?: (matchId: string) => void
  /**
   * Desktop: contenido del pronóstico que sale en un popover ANCLADO a la card
   * del cruce (no un modal/panel). Recibe el id y un `close`. Si se provee, el
   * botón "Predecir" abre ese popover en vez de llamar a `onPredict`.
   */
  renderPredict?: (matchId: string, close: () => void) => React.ReactNode
}

const CARD_W = 190
const CARD_H = 66
const V_GAP = 16
const ROUND_GAP = 84
const PITCH0 = CARD_H + V_GAP
const COL_STEP = CARD_W + ROUND_GAP

const MONTHS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
]
const defaultFmt = (iso: string) => {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

interface LayoutNode {
  id: string
  match: BracketMatch
  round: number
  index: number
  roundKey: string
  x: number
  y: number
  cy: number
  childIds: string[]
}

interface BracketLayout {
  nodes: Record<string, LayoutNode>
  parentOf: Record<string, string>
  width: number
  height: number
}

export function KnockoutBracket({
  rounds,
  thirdPlace,
  className,
  formatDate = defaultFmt,
  onPredict,
  renderPredict,
}: KnockoutBracketProps) {
  const [activeRound, setActiveRound] = React.useState(0)
  const [focusedId, setFocusedId] = React.useState<string | null>(null)
  const [containerW, setContainerW] = React.useState(760)
  const outerRef = React.useRef<HTMLDivElement>(null)

  // ── Layout: posiciones absolutas (árbol binario) ──
  const layout = React.useMemo((): BracketLayout => {
    const centers: number[][] = []
    rounds.forEach((r, ri) => {
      centers[ri] = r.matches.map((_, i) =>
        ri === 0
          ? i * PITCH0 + CARD_H / 2
          : (centers[ri - 1][2 * i] + centers[ri - 1][2 * i + 1]) / 2,
      )
    })

    const nodes: Record<string, LayoutNode> = {}
    rounds.forEach((r, ri) => {
      r.matches.forEach((mt, i) => {
        nodes[mt.id] = {
          id: mt.id,
          match: mt,
          round: ri,
          index: i,
          roundKey: r.key,
          x: ri * COL_STEP,
          cy: centers[ri][i],
          y: centers[ri][i] - CARD_H / 2,
          childIds: ri === 0 ? [] : (mt.feeds ?? []).filter(Boolean),
        }
      })
    })

    const parentOf: Record<string, string> = {}
    Object.values(nodes).forEach((n) =>
      n.childIds.forEach((c) => (parentOf[c] = n.id)),
    )

    const width = (rounds.length - 1) * COL_STEP + CARD_W
    const height = rounds[0].matches.length * PITCH0
    return { nodes, parentOf, width, height }
  }, [rounds])

  // ── Medición + recálculo en resize ──
  React.useEffect(() => {
    const el = outerRef.current
    if (!el) return
    const measure = () => setContainerW(el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // ── Camino resaltado (ancestros + descendientes del enfocado) ──
  const lineage = React.useMemo(() => {
    if (!focusedId) return null
    const set = new Set<string>([focusedId])
    let cur = focusedId
    while (layout.parentOf[cur]) {
      cur = layout.parentOf[cur]
      set.add(cur)
    }
    const stack = [focusedId]
    while (stack.length) {
      const id = stack.pop()!
      ;(layout.nodes[id]?.childIds ?? []).forEach((c) => {
        set.add(c)
        stack.push(c)
      })
    }
    return set
  }, [focusedId, layout])

  // ── Cámara: centra la ronda activa ──
  const tx = containerW / 2 - (activeRound * COL_STEP + CARD_W / 2)
  const go = (dir: number) =>
    setActiveRound((r) => Math.max(0, Math.min(rounds.length - 1, r + dir)))

  // Wheel horizontal → navegación.
  const wheelAcc = React.useRef(0)
  const onWheel = (e: React.WheelEvent) => {
    const dx =
      Math.abs(e.deltaX) > Math.abs(e.deltaY)
        ? e.deltaX
        : e.shiftKey
          ? e.deltaY
          : 0
    if (!dx) return
    wheelAcc.current += dx
    if (Math.abs(wheelAcc.current) > 60) {
      go(wheelAcc.current > 0 ? 1 : -1)
      wheelAcc.current = 0
    }
  }

  const finalRound = rounds[rounds.length - 1]
  const finalNode = finalRound ? layout.nodes[finalRound.matches[0].id] : null

  return (
    <div className={className}>
      {/* Pager de rondas */}
      <div className="mb-3 flex justify-center gap-1">
        {rounds.map((r, ri) => {
          const active = ri === activeRound
          return (
            <button
              key={r.key}
              onClick={() => setActiveRound(ri)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all',
                active
                  ? 'border-brand-primary bg-brand-primary text-white'
                  : 'border-border bg-surface text-text-secondary hover:text-text-primary',
              )}
            >
              <span className="md:hidden">{r.short}</span>
              <span className="hidden md:inline">{r.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tablero — flujo natural; solo recorta horizontal para la cámara */}
      <div
        ref={outerRef}
        onWheel={onWheel}
        className="relative [overflow-x:clip] py-2"
      >
        {/* Flechas pegadas al viewport mientras scrolleás */}
        <div className="sticky top-[70px] z-[5] h-0">
          <CameraArrow
            side="left"
            disabled={activeRound === 0}
            onClick={() => go(-1)}
          />
          <CameraArrow
            side="right"
            disabled={activeRound === rounds.length - 1}
            onClick={() => go(1)}
          />
        </div>

        {/* Canvas que se mueve como cámara */}
        <div
          className="relative transition-transform duration-[420ms] ease-[cubic-bezier(.4,0,.2,1)]"
          style={{
            width: layout.width,
            height: layout.height,
            transform: `translateX(${tx}px)`,
          }}
        >
          <Connectors layout={layout} lineage={lineage} />

          {Object.values(layout.nodes).map((node) => (
            <BracketNode
              key={node.id}
              node={node}
              dim={lineage ? !lineage.has(node.id) : false}
              focused={focusedId === node.id}
              formatDate={formatDate}
              onClick={() => {
                setFocusedId((f) => (f === node.id ? null : node.id))
                setActiveRound(node.round)
              }}
              onPredict={onPredict}
              renderPredict={renderPredict}
            />
          ))}

          {/* Tercer puesto — misma card, suelta bajo la final, sin conectores */}
          {finalNode && thirdPlace && (
            <ThirdPlaceCard
              finalNode={finalNode}
              match={thirdPlace}
              dim={lineage ? !lineage.has(thirdPlace.id) : false}
              focused={focusedId === thirdPlace.id}
              onClick={() => {
                setFocusedId((f) => (f === thirdPlace.id ? null : thirdPlace.id))
                setActiveRound(rounds.length - 1)
              }}
              onPredict={onPredict}
              renderPredict={renderPredict}
              formatDate={formatDate}
            />
          )}
        </div>
      </div>

      {/* Leyenda */}
      <div className="text-text-secondary mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[11px]">
        <span className="inline-flex items-center gap-1.5">
          <span className="bg-brand-primary h-0.5 w-3.5 rounded-sm" />
          Tocá un partido para ver su camino
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Info size={12} />
          {onPredict || renderPredict
            ? 'Pronosticá los cruces abiertos desde el cuadro'
            : 'Solo lectura — predecí desde el Calendario'}
        </span>
      </div>
    </div>
  )
}

/* --- Conectores --------------------------------------------------------- */
function Connectors({
  layout,
  lineage,
}: {
  layout: BracketLayout
  lineage: Set<string> | null
}) {
  const segs: {
    key: string
    d: string
    hl: boolean
    dim: boolean
    round: number
  }[] = []
  Object.values(layout.nodes).forEach((parent) => {
    parent.childIds.forEach((cid) => {
      const child = layout.nodes[cid]
      if (!child) return
      const childRightX = child.x + CARD_W
      const parentLeftX = parent.x
      const midX = childRightX + ROUND_GAP / 2
      const d = `M ${childRightX} ${child.cy} H ${midX} V ${parent.cy} H ${parentLeftX}`
      const hl = !!lineage && lineage.has(parent.id) && lineage.has(cid)
      segs.push({
        key: `${parent.id}-${cid}`,
        d,
        hl,
        dim: !!lineage && !hl,
        round: parent.round,
      })
    })
  })
  return (
    <svg
      className="pointer-events-none absolute inset-0 overflow-visible"
      style={{ width: layout.width, height: layout.height }}
    >
      {segs.map((s) => (
        <path
          key={s.key}
          d={s.d}
          fill="none"
          pathLength={1}
          className="[animation:pm-bk-draw_0.5s_ease_forwards] [stroke-dasharray:1] [stroke-dashoffset:1] motion-reduce:[animation:none] motion-reduce:[stroke-dashoffset:0]"
          style={{
            stroke: s.hl ? 'var(--brand-primary)' : 'var(--border-strong)',
            strokeWidth: s.hl ? 2.5 : 2,
            opacity: s.dim ? 0.25 : 1,
            transition: 'stroke 200ms, opacity 200ms, stroke-width 200ms',
            animationDelay: `${0.25 + s.round * 0.12}s`,
          }}
        />
      ))}
    </svg>
  )
}

/* --- Card de partido ---------------------------------------------------- */
function BracketNode({
  node,
  dim,
  focused,
  onClick,
  onPredict,
  renderPredict,
  formatDate,
}: {
  node: LayoutNode
  dim: boolean
  focused: boolean
  onClick: () => void
  onPredict?: (matchId: string) => void
  renderPredict?: (matchId: string, close: () => void) => React.ReactNode
  formatDate: (iso: string) => string
}) {
  const m = node.match
  const predicted = m.scoreKind === 'predicted'
  return (
    <div
      className="absolute transition-opacity duration-[250ms] ease-out"
      style={{
        left: node.x,
        top: node.y,
        width: CARD_W,
        opacity: dim ? 0.32 : 1,
        zIndex: focused ? 3 : 2,
      }}
    >
      {/* La card es el botón que togglea el camino. El botón "Predecir" va aparte
          (afuera) para no anidar <button> dentro de <button>. */}
      <button
        type="button"
        onClick={onClick}
        aria-pressed={focused}
        className="block w-full cursor-pointer text-left transition-transform duration-[250ms] ease-out"
        style={{
          transform: focused ? 'scale(1.04)' : 'scale(1)',
          transformOrigin: 'center',
        }}
      >
        <div
          className={cn(
            'bg-surface overflow-hidden rounded-[10px] border',
            '[animation:pm-bk-fade_0.45s_cubic-bezier(.4,0,.2,1)_both] motion-reduce:animate-none',
            focused
              ? 'border-brand-primary shadow-md'
              : 'border-border shadow-sm',
          )}
          style={{ animationDelay: `${node.round * 0.08 + node.index * 0.03}s` }}
        >
          <div
            className={cn(
              'border-border flex items-center gap-1 border-b px-2.5 py-[3px]',
              node.roundKey === 'final'
                ? 'bg-brand-accent-soft'
                : 'bg-surface-muted',
            )}
          >
            {predicted && <PickTag />}
            <span className="text-text-disabled ml-auto font-mono text-[9px]">
              {formatDate(m.kickoff)}
            </span>
          </div>
          <NodeSlot team={m.home} label={m.homeLabel} scoreKind={m.scoreKind} />
          <div className="bg-border h-px" />
          <NodeSlot team={m.away} label={m.awayLabel} scoreKind={m.scoreKind} />
        </div>
      </button>

      <PredictAffordance
        matchId={m.id}
        predictable={m.predictable}
        focused={focused}
        onPredict={onPredict}
        renderPredict={renderPredict}
      />
    </div>
  )
}

/**
 * The "Predecir" affordance shown on a focused, predictable node: on desktop the
 * editor pops out ANCHORED to the card (a popover from the pill); on mobile the
 * pill just signals and the sheet opens elsewhere. Shared by the regular nodes
 * and the third-place card.
 */
function PredictAffordance({
  matchId,
  predictable,
  focused,
  onPredict,
  renderPredict,
}: {
  matchId: string
  predictable?: boolean
  focused: boolean
  onPredict?: (matchId: string) => void
  renderPredict?: (matchId: string, close: () => void) => React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  if (!focused || !predictable || (!onPredict && !renderPredict)) return null
  if (renderPredict) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <PredictPill />
        </PopoverTrigger>
        <PopoverContent
          align="center"
          sideOffset={6}
          className="bg-surface w-[480px] max-w-[calc(100vw-2rem)] p-4"
        >
          {renderPredict(matchId, () => setOpen(false))}
        </PopoverContent>
      </Popover>
    )
  }
  return <PredictPill onClick={() => onPredict?.(matchId)} />
}

/**
 * The "Predecir" pill — identical to the Calendar's (MatchCardExpandable): same
 * Target icon, soft-teal fill + hover-teal text — floated below the card so it
 * reads as a control over the canvas. `forwardRef` so it can be a Popover
 * trigger.
 */
const PredictPill = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'>
>(function PredictPill(props, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className="bg-brand-primary-soft text-brand-primary-hover absolute left-1/2 top-full z-[1] inline-flex -translate-x-1/2 -translate-y-1.5 cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm"
      {...props}
    >
      <Target size={11} strokeWidth={2} aria-hidden="true" />
      Predecir
    </button>
  )
})

/** Tag amber "Pronóstico" — distingue el marcador pronosticado del real. */
function PickTag() {
  return (
    <span className="bg-brand-accent-soft rounded px-1 py-px text-[8px] font-bold tracking-[0.04em] text-[#92400E] uppercase">
      Pronóstico
    </span>
  )
}

function ThirdPlaceCard({
  finalNode,
  match,
  dim,
  focused,
  onClick,
  onPredict,
  renderPredict,
  formatDate,
}: {
  finalNode: LayoutNode
  match: BracketMatch
  dim: boolean
  focused: boolean
  onClick: () => void
  onPredict?: (matchId: string) => void
  renderPredict?: (matchId: string, close: () => void) => React.ReactNode
  formatDate: (iso: string) => string
}) {
  const top = finalNode.y + CARD_H + 42
  const predicted = match.scoreKind === 'predicted'
  return (
    <div
      className="absolute transition-opacity duration-[250ms] ease-out"
      style={{
        left: finalNode.x,
        top,
        width: CARD_W,
        opacity: dim ? 0.32 : 1,
        zIndex: focused ? 3 : 2,
      }}
    >
      <button
        type="button"
        onClick={onClick}
        aria-pressed={focused}
        className="block w-full cursor-pointer text-left transition-transform duration-[250ms] ease-out"
        style={{
          transform: focused ? 'scale(1.04)' : 'scale(1)',
          transformOrigin: 'center',
        }}
      >
        <div
          className={cn(
            'bg-surface [animation:pm-bk-fade_0.45s_cubic-bezier(.4,0,.2,1)_both] overflow-hidden rounded-[10px] border motion-reduce:animate-none',
            focused
              ? 'border-brand-primary shadow-md'
              : 'border-border shadow-sm',
          )}
          style={{ animationDelay: '0.5s' }}
        >
          <div className="border-border bg-surface-muted flex items-center justify-between gap-1 border-b px-2.5 py-[3px]">
            <span className="text-text-secondary text-[9px] font-bold tracking-[0.06em] uppercase">
              3er puesto
            </span>
            <span className="flex items-center gap-1">
              {predicted && <PickTag />}
              <span className="text-text-disabled font-mono text-[9px]">
                {formatDate(match.kickoff)}
              </span>
            </span>
          </div>
          <NodeSlot team={match.home} label={match.homeLabel} scoreKind={match.scoreKind} />
          <div className="bg-border h-px" />
          <NodeSlot team={match.away} label={match.awayLabel} scoreKind={match.scoreKind} />
        </div>
      </button>

      <PredictAffordance
        matchId={match.id}
        predictable={match.predictable}
        focused={focused}
        onPredict={onPredict}
        renderPredict={renderPredict}
      />
    </div>
  )
}

function NodeSlot({
  team,
  label,
  scoreKind,
}: {
  team: BracketTeam | null
  label?: string
  scoreKind?: 'real' | 'predicted' | null
}) {
  const pending = !team
  const outcome = team?.pickOutcome ?? null
  const myAdvancer = team?.isMyAdvancer ?? false
  const hasScore = !!team && team.score != null
  return (
    <div
      className={cn(
        'flex items-center gap-[7px] px-2.5 py-1.5',
        // Señal de pronóstico de avance (Penca): verde acerté / rojo erré. Mismo
        // degradé que ResultCard (wash de arriba a abajo con los *-soft tokens
        // que se desvanece al surface) — no un color plano. Más saturado que en
        // ResultCard porque la franja es fina: mantiene color por el medio antes
        // de fundir al surface, para que se note.
        outcome === 'correct' &&
          'bg-gradient-to-b from-success-soft via-success-soft/30 to-surface',
        outcome === 'incorrect' &&
          'bg-gradient-to-b from-danger-soft via-danger-soft/30 to-surface',
        // Antes de jugarse: el equipo que elegí para avanzar va en amber (mismo
        // token que el tag "Pronóstico").
        !outcome &&
          myAdvancer &&
          'bg-gradient-to-b from-brand-accent-soft via-brand-accent-soft/30 to-surface',
      )}
    >
      {pending || !team.flag ? (
        <div className="border-border bg-surface-muted h-[13px] w-[18px] shrink-0 rounded-sm border" />
      ) : (
        <span className="inline-flex h-[13px] w-[18px] shrink-0 overflow-hidden rounded-sm shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]">
          <img src={team.flag} alt="" className="size-full object-cover" />
        </span>
      )}
      <span
        className={cn(
          'min-w-0 flex-1 truncate text-xs',
          pending
            ? 'text-text-disabled font-semibold'
            : team.isAdvancing
              ? 'text-text-primary font-bold'
              : 'text-text-primary font-semibold',
        )}
      >
        {team ? team.name : (label ?? 'Por definir')}
      </span>
      {hasScore ? (
        // Marcador REAL → números neutros fuertes. PRONOSTICADO → amber tenue,
        // para que nunca se confunda con el resultado real.
        <span
          className={cn(
            'shrink-0 text-xs tabular-nums',
            scoreKind === 'predicted'
              ? 'font-semibold text-[#92400E]'
              : 'text-text-primary font-bold',
          )}
        >
          {team.score}
        </span>
      ) : (
        <span className="text-text-disabled font-mono text-[9.5px]">
          {team ? team.code3 : 'TBD'}
        </span>
      )}
    </div>
  )
}

function CameraArrow({
  side,
  disabled,
  onClick,
}: {
  side: 'left' | 'right'
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={side === 'left' ? 'Ronda anterior' : 'Ronda siguiente'}
      className={cn(
        'border-border bg-surface text-text-primary absolute top-[150px] z-[5] inline-flex size-[38px] items-center justify-center rounded-full border shadow-md transition-opacity',
        side === 'left' ? 'left-1.5' : 'right-1.5',
        disabled ? 'cursor-default opacity-35' : 'opacity-100',
      )}
    >
      {side === 'left' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
    </button>
  )
}
