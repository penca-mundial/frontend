import * as React from 'react'
import {
  BracketPredictionForm,
  BracketPredictionSheet,
} from '@/components/matches/BracketPrediction'
import { KnockoutBracket } from '@/components/matches/KnockoutBracket'
import { Skeleton } from '@/components/ui/skeleton'
import { ProjectedStandingsNote } from '@/features/matches/components/ProjectedStandingsNote'
import {
  bracketMatchToMatch,
  projectedToKnockoutBracket,
  toKnockoutBracket,
} from '@/features/matches/bracketAdapter'
import { useBracket } from '@/features/matches/hooks/useBracket'
import { useProjectedBracket } from '@/features/matches/hooks/useProjectedBracket'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useAllMyPredictions } from '@/features/predictions/hooks/useAllMyPredictions'
import { useTournament } from '@/features/tournament-predictions/hooks/useTournament'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { Match } from '@/features/matches/types'
import type { Prediction } from '@/features/predictions/types'
import { formatKickoff } from '@/lib/date'
import { detectUserTimezone } from '@/lib/timezone'

function BracketSkeleton() {
  return (
    <div className="flex gap-6" aria-busy="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-72 w-44 rounded-lg" />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <p className="text-text-secondary text-body-sm py-8 text-center">
      Las eliminatorias se publican cuando se confirmen los cruces.
    </p>
  )
}

/**
 * The knockout view (read-only, data-driven). Source switches on the backend
 * `projected` flag — no manual toggle:
 *   - signed-in & still projected → the viewer's projected Round-of-32 ("según
 *     tus pronósticos", blended with real results) + the explanatory note;
 *   - signed-in & confirmed (projected:false), or anonymous → the official
 *     `/bracket` tree.
 * The official query stays disabled until needed, so projected:true is a single
 * fetch; projected:false is two dependent fetches; anonymous is one.
 */
export function EliminationView() {
  const { currentUser } = useCurrentUser()
  const isAuthed = currentUser !== null
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const tournamentQuery = useTournament()
  const tournamentId = tournamentQuery.data?.id
  const timezone = detectUserTimezone()
  // Projected slots carry no kickoff (`''`) — render no date for them.
  const formatDate = (iso: string) =>
    iso ? formatKickoff(iso, 'date', timezone) : ''

  const projectedQuery = useProjectedBracket(tournamentId, { enabled: isAuthed })
  const showProjected =
    isAuthed && !projectedQuery.isError && projectedQuery.data?.projected === true

  // Fall back to the official bracket for anonymous viewers, once projected is
  // confirmed false, or if the projected fetch failed.
  const officialQuery = useBracket(tournamentId, {
    enabled:
      !isAuthed ||
      projectedQuery.isError ||
      projectedQuery.data?.projected === false,
  })

  // The viewer's own picks (ungated, all pages) — merged into the official tree
  // so open crosses show the PREDICTED score the gated /bracket payload omits,
  // and the editor pre-fills. Authed only.
  const predictionsQuery = useAllMyPredictions({ enabled: isAuthed })
  const predictionsByMatch = predictionsQuery.data

  // Which open cross has its prediction sheet open.
  const [predictMatchId, setPredictMatchId] = React.useState<string | null>(null)

  // matchId → { Match, existing pick } for the official tree, to feed the editor.
  const predictionTargets = React.useMemo(() => {
    const map = new Map<string, { match: Match; prediction: Prediction | null }>()
    for (const match of officialQuery.data ?? []) {
      const prediction = predictionsByMatch?.get(match.id) ?? null
      map.set(match.id, {
        match: bracketMatchToMatch(match, prediction),
        prediction,
      })
    }
    return map
  }, [officialQuery.data, predictionsByMatch])

  if (tournamentQuery.isLoading) return <BracketSkeleton />
  // Still deciding the source for a signed-in viewer.
  if (isAuthed && projectedQuery.isLoading) return <BracketSkeleton />

  if (showProjected && projectedQuery.data) {
    const { rounds, thirdPlace } = projectedToKnockoutBracket(
      projectedQuery.data.roundOf32,
    )
    if (rounds[0].matches.length === 0) return <EmptyState />
    return (
      <div className="flex flex-col gap-3">
        <ProjectedStandingsNote />
        <KnockoutBracket
          rounds={rounds}
          thirdPlace={thirdPlace}
          formatDate={formatDate}
        />
      </div>
    )
  }

  if (officialQuery.isLoading) return <BracketSkeleton />
  if (officialQuery.isError || !officialQuery.data) {
    return (
      <p className="text-danger text-body">
        No pudimos cargar el cuadro. Intentá de nuevo.
      </p>
    )
  }

  const { rounds, thirdPlace } = toKnockoutBracket(
    officialQuery.data,
    predictionsByMatch,
  )
  if (rounds.length === 0) return <EmptyState />

  // Mobile opens a bottom sheet (tracked by id); desktop pops the editor out of
  // the card via a popover. Only authed viewers predict — anonymous is read-only.
  const sheetTarget =
    !isDesktop && predictMatchId ? predictionTargets.get(predictMatchId) : null

  return (
    <>
      <KnockoutBracket
        rounds={rounds}
        thirdPlace={thirdPlace}
        formatDate={formatDate}
        onPredict={isAuthed && !isDesktop ? setPredictMatchId : undefined}
        renderPredict={
          isAuthed && isDesktop
            ? (matchId, close) => {
                const target = predictionTargets.get(matchId)
                return target ? (
                  <BracketPredictionForm
                    match={target.match}
                    initial={target.prediction}
                    onClose={close}
                  />
                ) : null
              }
            : undefined
        }
      />
      {sheetTarget && (
        <BracketPredictionSheet
          match={sheetTarget.match}
          initial={sheetTarget.prediction}
          onClose={() => setPredictMatchId(null)}
        />
      )}
    </>
  )
}
