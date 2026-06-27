import * as React from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionLabel } from '@/components/ui/section-label'
import { PredictionStepper } from '@/components/matches/PredictionStepper'
import type { Match, MatchTeam } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'
import { isKnockoutPhase } from '@/features/matches/utils'
import { cn } from '@/lib/cn'

export interface PredictionInput {
  home: number
  away: number
  advancing?: string | null
}

export interface PredictionEditorProps {
  match: Match
  initial?: Prediction | null
  /** Async — the editor shows a loading state; the parent closes on success. */
  onSave: (input: PredictionInput) => Promise<void> | void
  onCancel: () => void
  variant?: 'inline' | 'sheet'
}

function teamName(team: MatchTeam | null): string {
  return team?.name ?? 'Por definir'
}

function teamCode(team: MatchTeam | null): string {
  return team?.code3 ?? '—'
}

function TeamFlag({ team, size = 24 }: { team: MatchTeam | null; size?: number }) {
  if (team?.flagUrl) {
    return (
      <img
        src={team.flagUrl}
        alt=""
        className="rounded-[3px] object-cover"
        style={{ width: size, height: Math.round(size * 0.7) }}
      />
    )
  }
  return (
    <span
      className="bg-surface-muted text-text-secondary text-mono-mini inline-flex items-center justify-center rounded-[3px]"
      style={{ width: size, height: Math.round(size * 0.7) }}
    >
      {teamCode(team)}
    </span>
  )
}

function TeamStepper({
  team,
  value,
  onChange,
  disabled,
}: {
  team: MatchTeam | null
  value: number
  onChange: (n: number) => void
  disabled: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      {/* Flag when we have it; otherwise the code at the same size/weight as the
          fixture card's team name (TeamSide) so the editor matches the card. */}
      {team?.flagUrl ? (
        <TeamFlag team={team} size={40} />
      ) : (
        <span className="text-base font-semibold md:text-lg">
          {teamCode(team)}
        </span>
      )}
      <PredictionStepper
        label={teamName(team)}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  )
}

/**
 * The prediction editor itself — steppers for each team plus, for knockouts, an
 * advancing-team picker. Used inline (desktop fixture row expansion) and inside
 * the bottom sheet (mobile). Holds the draft locally and calls `onSave`; it does
 * no fetching, so it can be driven from any surface.
 */
export function PredictionEditor({
  match,
  initial,
  onSave,
  onCancel,
  variant = 'inline',
}: PredictionEditorProps) {
  const knockout = isKnockoutPhase(match.phase)
  const [home, setHome] = React.useState(initial?.predictedHomeScore ?? 0)
  const [away, setAway] = React.useState(initial?.predictedAwayScore ?? 0)
  const [advancing, setAdvancing] = React.useState<string | null>(
    initial?.predictedAdvancingTeamId ?? null,
  )
  const [saving, setSaving] = React.useState(false)

  const canSave = (!knockout || advancing !== null) && !saving
  const isSheet = variant === 'sheet'

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    try {
      await onSave({ home, away, advancing: knockout ? advancing : undefined })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={cn(isSheet ? 'px-4 pb-4' : 'pt-1')}>
      {isSheet ? (
        <div className="border-border mb-3.5 flex items-center justify-between border-b pb-3">
          <div>
            <SectionLabel size="sm" className="block">
              Tu pronóstico
            </SectionLabel>
            <div className="mt-0.5 flex items-center gap-1.5 text-body-sm font-semibold">
              <span>{teamCode(match.homeTeam)}</span>
              <span className="text-text-disabled">vs</span>
              <span>{teamCode(match.awayTeam)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cerrar"
            className="bg-surface-muted inline-flex size-8 items-center justify-center rounded-lg"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <SectionLabel size="sm" className="mb-2.5 block">
          Tu pronóstico
        </SectionLabel>
      )}

      <div className="bg-surface-muted grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl p-3.5">
        <TeamStepper
          team={match.homeTeam}
          value={home}
          onChange={setHome}
          disabled={saving}
        />
        <span className="font-display text-text-disabled px-1 text-2xl font-bold">
          –
        </span>
        <TeamStepper
          team={match.awayTeam}
          value={away}
          onChange={setAway}
          disabled={saving}
        />
      </div>

      {knockout && (
        <fieldset className="mt-3.5">
          <SectionLabel
            as="legend"
            size="sm"
            tone="secondary"
            className="mb-2 block w-full text-center"
          >
            ¿Quién pasa de ronda?
          </SectionLabel>
          <div
            role="radiogroup"
            aria-label="¿Quién pasa de ronda?"
            // Two equal-width chips (both sized to the longer name), centered as
            // a group — not full-width bars, not pinned to the margins. Capped at
            // the available width so a very long name (e.g. "Bosnia and
            // Herzegovina") can't overflow: it then truncates (flag still IDs it).
            className="mx-auto grid w-fit max-w-full grid-cols-2 gap-3"
          >
            {[match.homeTeam, match.awayTeam].map((team, index) => {
              const selected = team !== null && advancing === team.id
              const isHome = index === 0
              const flag = (
                <span className="shrink-0">
                  <TeamFlag team={team} size={20} />
                </span>
              )
              const name = (
                <span className="min-w-0 truncate">{teamName(team)}</span>
              )
              return (
                <button
                  key={team?.id ?? index}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={team === null || saving}
                  onClick={() => team && setAdvancing(team.id)}
                  // Flag + name sit together; flags point OUTWARD (home left /
                  // away right), mirroring the scoreboard above.
                  className={cn(
                    'flex w-full min-w-0 items-center justify-center gap-2 rounded-[10px] border-[1.5px] px-4 py-2 text-body-sm font-semibold transition-colors disabled:opacity-50',
                    selected
                      ? 'border-brand-primary bg-brand-primary-soft text-brand-primary-hover'
                      : 'border-border bg-surface text-text-primary hover:bg-surface-muted',
                  )}
                >
                  {isHome ? (
                    <>
                      {flag}
                      {name}
                    </>
                  ) : (
                    <>
                      {name}
                      {flag}
                    </>
                  )}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      <div className="mt-3.5 flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size={isSheet ? 'default' : 'sm'}
          onClick={onCancel}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          size={isSheet ? 'default' : 'sm'}
          onClick={handleSave}
          disabled={!canSave}
        >
          {!saving && <Check />}
          {saving ? 'Guardando…' : 'Guardar pronóstico'}
        </Button>
      </div>
    </div>
  )
}
