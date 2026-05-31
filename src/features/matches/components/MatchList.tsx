import { MatchCard } from '@/features/matches/components/MatchCard'
import type { Match } from '@/features/matches/types'
import { formatMatchDay, matchDayKey } from '@/lib/date'

export interface MatchListProps {
  matches: Match[]
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
        label: formatMatchDay(match.kickoffAt, timezone),
        matches: [match],
      })
    }
  }
  return [...groups.values()]
}

/** Renders matches grouped by calendar day in the user's timezone. */
export function MatchList({ matches, timezone }: MatchListProps) {
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
              <MatchCard key={match.id} match={match} timezone={timezone} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
