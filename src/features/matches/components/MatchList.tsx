import { MatchCardExpandable } from '@/components/matches/MatchCardExpandable'
import type { Match } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'
import { formatDayHeading, matchDayKey } from '@/lib/date'

export interface MatchListProps {
  matches: Match[]
  /** User predictions keyed by match id, for the inline prediction display. */
  predictions: Map<string, Prediction>
  timezone: string
}

interface DayGroup {
  key: string
  label: string
  matches: Match[]
}

function groupByDay(matches: Match[], timezone: string): DayGroup[] {
  const sorted = [...matches].sort(
    (a, b) =>
      new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime(),
  )
  const groups = new Map<string, DayGroup>()
  for (const match of sorted) {
    const key = matchDayKey(match.kickoffAt, timezone)
    const group = groups.get(key)
    if (group) {
      group.matches.push(match)
    } else {
      groups.set(key, {
        key,
        label: formatDayHeading(match.kickoffAt, timezone),
        matches: [match],
      })
    }
  }
  return [...groups.values()]
}

/**
 * Matches grouped by calendar day (user timezone), each rendered as a
 * `MatchCardExpandable` so predictions happen inline from the list. Each day
 * heading shows the full date, a "HOY" badge for the current day, and the
 * match count.
 */
export function MatchList({ matches, predictions, timezone }: MatchListProps) {
  const groups = groupByDay(matches, timezone)
  const todayKey = matchDayKey(new Date(), timezone)

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => {
        const count = group.matches.length
        return (
          <section key={group.key} className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-text-primary text-body-sm flex items-center gap-2 font-semibold">
                {group.label}
                {group.key === todayKey && (
                  <span className="bg-brand-accent-soft text-mono-mini rounded-full px-2 py-0.5 font-bold uppercase text-[#92400E]">
                    Hoy
                  </span>
                )}
              </h2>
              <span className="text-text-secondary text-mono-mini">
                {count} {count === 1 ? 'partido' : 'partidos'}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {group.matches.map((match) => (
                <MatchCardExpandable
                  key={match.id}
                  match={match}
                  prediction={predictions.get(match.id) ?? null}
                  timezone={timezone}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
