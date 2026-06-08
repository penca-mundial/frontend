import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { EvolutionLine } from '@/api/rankings.api'
import { cn } from '@/lib/cn'

export type EvolutionMetric = 'points' | 'rank'

export interface EvolutionChartProps {
  lines: EvolutionLine[]
  metric: EvolutionMetric
  /** The current user's id — their line is highlighted (teal, thicker). */
  currentUserId: string | null
  /** Overrides for tests / fixed layouts; otherwise the width is measured. */
  width?: number
  height?: number
}

/** Teal for the current user; an on-brand palette cycles for the others. */
const BRAND_TEAL = '#0f766e'
const PALETTE = ['#f59e0b', '#64748b', '#e11d48', '#6366f1', '#0ea5e9']

const PADDING = { top: 16, right: 16, bottom: 28, left: 34 }
const DEFAULT_WIDTH = 640

/**
 * Format the `series` date (a plain calendar date — the UTC snapshot day) as a
 * short "12/6" axis label. Parsed from the string parts, NOT via `new Date()` +
 * timezone conversion: that would re-interpret a date-only value as a UTC
 * instant and shift it a day in negative-offset zones.
 */
function shortDate(iso: string): string {
  const [, month, day] = iso.split('-')
  return `${Number(day)}/${Number(month)}`
}

/**
 * Single evolution line chart for the per-penca stats (SCRUM-302). Dependency-
 * free SVG so it stays on the Cancha tokens. Two modes via `metric`:
 *   - `points`: Y = cumulative points (more is higher).
 *   - `rank`:   Y = position, axis INVERTED (1º at the top), integer ticks;
 *               tied ranks share a Y because they share a value.
 * The current user's line is drawn last, teal and thicker; a legend lists the
 * usernames. Width is measured (responsive) unless given.
 */
export function EvolutionChart({
  lines,
  metric,
  currentUserId,
  width,
  height = 280,
}: EvolutionChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [measured, setMeasured] = useState<number | null>(null)

  useLayoutEffect(() => {
    if (width || !containerRef.current) return
    const el = containerRef.current
    const update = () => setMeasured(el.clientWidth)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [width])

  const w = width ?? measured ?? DEFAULT_WIDTH
  const h = height
  const plotW = Math.max(0, w - PADDING.left - PADDING.right)
  const plotH = Math.max(0, h - PADDING.top - PADDING.bottom)

  const geometry = useMemo(() => {
    const dates = [
      ...new Set(lines.flatMap((l) => l.series.map((p) => p.date))),
    ].sort()
    const xByDate = new Map(
      dates.map((date, i) => [
        date,
        PADDING.left + (dates.length <= 1 ? plotW / 2 : (i / (dates.length - 1)) * plotW),
      ]),
    )

    const value = (p: { points: number; rank: number }) =>
      metric === 'points' ? p.points : p.rank
    const values = lines.flatMap((l) => l.series.map(value))
    const maxValue = Math.max(1, ...values)

    // points: 0..max, more is higher (smaller y). rank: 1..max, INVERTED so
    // rank 1 sits at the top (smallest y).
    const yOf = (v: number) => {
      if (metric === 'points') {
        return PADDING.top + plotH - (v / maxValue) * plotH
      }
      const span = maxValue - 1 || 1
      return PADDING.top + ((v - 1) / span) * plotH
    }

    const ticks =
      metric === 'rank'
        ? Array.from({ length: maxValue }, (_, i) => i + 1)
        : [0, Math.round(maxValue / 2), maxValue].filter(
            (v, i, a) => a.indexOf(v) === i,
          )

    return { dates, xByDate, yOf, ticks }
  }, [lines, metric, plotW, plotH])

  if (lines.length === 0) return null

  const ordered = [
    ...lines.filter((l) => l.userId !== currentUserId),
    ...lines.filter((l) => l.userId === currentUserId),
  ]
  const colorFor = (line: EvolutionLine, indexAmongOthers: number) =>
    line.userId === currentUserId
      ? BRAND_TEAL
      : PALETTE[indexAmongOthers % PALETTE.length]

  let otherIndex = 0
  const colored = ordered.map((line) => {
    const isCurrent = line.userId === currentUserId
    const color = isCurrent ? BRAND_TEAL : colorFor(line, otherIndex++)
    return { line, isCurrent, color }
  })

  return (
    <div ref={containerRef} className="w-full">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        height={h}
        role="img"
        aria-label={
          metric === 'points'
            ? 'Evolución de puntos acumulados'
            : 'Evolución de posición en la penca'
        }
      >
        {/* Y grid + ticks */}
        {geometry.ticks.map((tick) => {
          const y = geometry.yOf(tick)
          return (
            <g key={tick}>
              <line
                x1={PADDING.left}
                x2={w - PADDING.right}
                y1={y}
                y2={y}
                className="stroke-border"
                strokeWidth={1}
              />
              <text
                data-testid="evolution-ytick"
                x={PADDING.left - 6}
                y={y + 3}
                textAnchor="end"
                className="fill-text-disabled font-mono text-[9px]"
              >
                {tick}
              </text>
            </g>
          )
        })}

        {/* X date labels */}
        {geometry.dates.map((date) => (
          <text
            key={date}
            x={geometry.xByDate.get(date)}
            y={h - 8}
            textAnchor="middle"
            className="fill-text-disabled font-mono text-[9px]"
          >
            {shortDate(date)}
          </text>
        ))}

        {/* Lines (current user last → on top) */}
        {colored.map(({ line, isCurrent, color }) => {
          const pts = line.series
            .map((p) => {
              const x = geometry.xByDate.get(p.date) ?? PADDING.left
              const y = geometry.yOf(metric === 'points' ? p.points : p.rank)
              return `${x.toFixed(2)},${y.toFixed(2)}`
            })
            .join(' ')
          return (
            <g key={line.userId}>
              <polyline
                data-testid="evolution-line"
                data-user={line.userId}
                data-current={isCurrent ? 'true' : 'false'}
                points={pts}
                fill="none"
                stroke={color}
                strokeWidth={isCurrent ? 3 : 1.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {line.series.map((p) => {
                const x = geometry.xByDate.get(p.date) ?? PADDING.left
                const y = geometry.yOf(metric === 'points' ? p.points : p.rank)
                return (
                  <circle
                    key={p.date}
                    cx={x}
                    cy={y}
                    r={isCurrent ? 3.5 : 2.5}
                    fill={color}
                  />
                )
              })}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <ul
        data-testid="evolution-legend"
        className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5"
      >
        {colored.map(({ line, isCurrent, color }) => (
          <li
            key={line.userId}
            className={cn(
              'inline-flex items-center gap-1.5 text-body-sm',
              isCurrent ? 'text-text-primary font-semibold' : 'text-text-secondary',
            )}
          >
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            {line.username ?? 'Sin nombre'}
            {isCurrent && <span className="text-brand-primary"> · vos</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
