/**
 * Static scoring rules. Base points follow the design reference; the per-phase
 * multipliers are the seed's PhaseMultiplier values (hardcoded — Landing is
 * fully static, no live data).
 */
const BASE_POINTS: { label: string; example: string; points: string }[] = [
  { label: 'Resultado exacto', example: '3–1 → 3–1', points: '10' },
  { label: 'Misma diferencia', example: '2–0 → 3–1', points: '6' },
  { label: 'Solo el ganador', example: 'acertás quién gana', points: '3' },
]

const PHASE_MULTIPLIERS: { phase: string; multiplier: string }[] = [
  { phase: 'Fase de grupos', multiplier: '×1.0' },
  { phase: 'Dieciseisavos', multiplier: '×1.5' },
  { phase: 'Octavos', multiplier: '×2.0' },
  { phase: 'Cuartos', multiplier: '×2.5' },
  { phase: 'Semis', multiplier: '×3.0' },
  { phase: '3er puesto', multiplier: '×3.5' },
  { phase: 'Final', multiplier: '×4.0' },
]

export function ScoringRulesTable() {
  return (
    <section className="px-5 py-12 md:px-10 md:py-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-text-secondary text-[11px] font-semibold tracking-[0.12em] uppercase">
          Reglas
        </p>
        <h2 className="font-display mt-2 mb-7 text-[clamp(26px,5vw,38px)] font-bold leading-tight tracking-tight">
          Cómo se reparten los puntos.
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          <table className="border-border bg-surface w-full overflow-hidden rounded-2xl border text-left">
            <caption className="text-text-secondary px-4 pt-4 pb-1 text-left text-body-sm font-semibold">
              Puntos base por partido
            </caption>
            <tbody>
              {BASE_POINTS.map((row) => (
                <tr key={row.label} className="border-border border-t">
                  <th scope="row" className="text-body-sm px-4 py-3 font-semibold">
                    {row.label}
                  </th>
                  <td className="text-text-secondary px-2 py-3 font-mono text-xs">
                    {row.example}
                  </td>
                  <td className="text-brand-primary font-display px-4 py-3 text-right text-xl font-bold tabular-nums">
                    {row.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <table className="border-border bg-surface w-full overflow-hidden rounded-2xl border text-left">
            <caption className="text-text-secondary px-4 pt-4 pb-1 text-left text-body-sm font-semibold">
              Multiplicador por fase
            </caption>
            <tbody>
              {PHASE_MULTIPLIERS.map((row) => (
                <tr key={row.phase} className="border-border border-t">
                  <th scope="row" className="text-body-sm px-4 py-2.5 font-medium">
                    {row.phase}
                  </th>
                  <td className="text-brand-primary font-display px-4 py-2.5 text-right text-body-lg font-bold tabular-nums">
                    {row.multiplier}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-text-secondary text-body-sm mt-4 leading-relaxed">
          El puntaje de cada partido se multiplica según la fase. Además, al
          arranque elegís campeón, subcampeón, tercero, cuarto y goleador: cada
          acierto también suma.
        </p>
      </div>
    </section>
  )
}
