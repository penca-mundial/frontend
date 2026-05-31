import { MatchCardExpandable } from '@/components/matches/MatchCardExpandable'
import type { Match } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'
import { formatKickoff, matchDayKey } from '@/lib/date'

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
        label: formatKickoff(match.kickoffAt, 'day-header', timezone),
        matches: [match],
      })
    }
  }
  return [...groups.values()]
}

/**
 * Matches grouped by calendar day (user timezone), each rendered as a
 * `MatchCardExpandable` so predictions happen inline from the list.
 */
export function MatchList({ matches, predictions, timezone }: MatchListProps) {
  const groups = groupByDay(matches, timezone)

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.key} className="flex flex-col gap-3">
          <h2 className="text-text-secondary text-mono-mini font-semibold tracking-wide uppercase">
            {group.label}
          </h2>
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
      ))}
    </div>
  )
}
