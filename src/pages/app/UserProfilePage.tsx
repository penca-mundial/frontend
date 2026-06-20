import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { ProfilePredictionsFeed } from '@/features/users/components/ProfilePredictionsFeed'
import { ProfileStatsBlock } from '@/features/users/components/ProfileStatsBlock'
import { ProfileTournamentPredictionBlock } from '@/features/users/components/ProfileTournamentPredictionBlock'
import { SharedGroupsBlock } from '@/features/users/components/SharedGroupsBlock'
import { UserProfileHeader } from '@/features/users/components/UserProfileHeader'
import { useUserProfile } from '@/features/users/hooks/useUserProfile'

function BackButton() {
  const navigate = useNavigate()
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-text-secondary -ml-2 self-start"
      onClick={() => navigate(-1)}
    >
      <ArrowLeft aria-hidden="true" />
      Volver
    </Button>
  )
}

/**
 * Public profile of any user (`/app/users/:id`): header (avatar + standing),
 * shared pencas, the gated tournament prediction, accuracy stats, and the
 * paginated match-picks feed. Reached from ranking rows and penca members. The
 * viewer's own profile is not a special case — it renders the same way.
 */
export function UserProfilePage() {
  const { id } = useParams()
  const userId = id ?? ''
  const { currentUser } = useCurrentUser()
  const { data: profile, isLoading, isError } = useUserProfile(userId)

  if (isLoading) {
    return (
      <div
        className="mx-auto flex w-full max-w-2xl flex-col gap-6"
        aria-busy="true"
      >
        <Skeleton className="h-8 w-20 rounded-md" />
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-40 rounded-lg" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-4">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-text-secondary -ml-2"
        >
          <Link to="/app/rankings">
            <ArrowLeft aria-hidden="true" />
            Volver
          </Link>
        </Button>
        <p className="text-danger text-body">
          No encontramos este perfil. Puede que el jugador no exista.
        </p>
      </div>
    )
  }

  const isMe = currentUser?.id === profile.user.id

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <BackButton />
      <UserProfileHeader
        user={profile.user}
        ranking={profile.globalRanking}
        isMe={isMe}
      />
      <SharedGroupsBlock groups={profile.sharedGroups} />
      <ProfileTournamentPredictionBlock
        prediction={profile.tournamentPrediction}
      />
      <ProfileStatsBlock stats={profile.stats} />
      <ProfilePredictionsFeed userId={userId} />
    </div>
  )
}
