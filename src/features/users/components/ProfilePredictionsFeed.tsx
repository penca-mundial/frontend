import { useId } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ResultCard } from '@/features/home/components/ResultCard'
import { useUserPredictions } from '@/features/users/hooks/useUserPredictions'

function Heading({ id }: { id: string }) {
  return (
    <h2
      id={id}
      className="text-text-secondary text-[11px] font-semibold tracking-wide uppercase"
    >
      Partidos
    </h2>
  )
}

export interface ProfilePredictionsFeedProps {
  userId: string
}

/**
 * "Partidos" on a public profile: the viewed user's locked match picks, each
 * rendered with the home `ResultCard` (the pick + the points it earns), live
 * match first. Paginated via `has_more` ("Ver más"). The lock/reveal gate lives
 * server-side, so every entry here is safe to show.
 */
export function ProfilePredictionsFeed({ userId }: ProfilePredictionsFeedProps) {
  const headingId = useId()
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useUserPredictions(userId)

  if (isLoading) {
    return (
      <section aria-labelledby={headingId} className="flex flex-col gap-3">
        <Heading id={headingId} />
        <div className="flex flex-col gap-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section aria-labelledby={headingId} className="flex flex-col gap-3">
        <Heading id={headingId} />
        <p className="text-danger text-body">
          No pudimos cargar los partidos. Intentá de nuevo.
        </p>
      </section>
    )
  }

  const entries = data?.pages.flatMap((page) => page.entries) ?? []

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <Heading id={headingId} />
      {entries.length === 0 ? (
        <div className="border-border bg-surface rounded-xl border border-dashed p-8 text-center">
          <p className="text-text-primary text-body font-semibold">
            Todavía no hay pronósticos para mostrar
          </p>
          <p className="text-text-secondary text-body-sm mx-auto mt-1 max-w-sm">
            Aparecen acá cuando los partidos arrancan.
          </p>
        </div>
      ) : (
        <>
          {entries.map((match) => (
            <ResultCard
              key={match.id}
              match={match}
              predictionLabel="Pronóstico"
            />
          ))}
          {hasNextPage && (
            <Button
              variant="outline"
              className="self-center"
              onClick={() => void fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Cargando…' : 'Ver más'}
            </Button>
          )}
        </>
      )}
    </section>
  )
}
