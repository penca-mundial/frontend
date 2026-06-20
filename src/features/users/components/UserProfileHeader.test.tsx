import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { UserProfileHeader } from '@/features/users/components/UserProfileHeader'
import type {
  ProfileGlobalRanking,
  PublicProfileUser,
} from '@/features/users/types'

const user: PublicProfileUser = {
  id: '42',
  username: 'leo',
  avatarUrl: null,
}

function ranking(
  overrides: Partial<ProfileGlobalRanking> = {},
): ProfileGlobalRanking {
  return { rankPosition: 7, points: 31, exactCount: 4, total: 128, ...overrides }
}

describe('UserProfileHeader', () => {
  it('shows the username (bare) and the global standing line', () => {
    render(<UserProfileHeader user={user} ranking={ranking()} />)

    expect(
      screen.getByRole('heading', { level: 1, name: /leo/ }),
    ).toBeInTheDocument()
    expect(screen.getByText(/N\.º 7 de 128 · 31 pts/)).toBeInTheDocument()
  })

  it('degrades gracefully when the user has no ranked position', () => {
    render(
      <UserProfileHeader
        user={user}
        ranking={ranking({ rankPosition: null, points: 0 })}
      />,
    )
    expect(
      screen.getByText(/Sin posición en el ranking general/),
    ).toBeInTheDocument()
  })

  it('marks the viewer own profile with "· vos"', () => {
    render(<UserProfileHeader user={user} ranking={ranking()} isMe />)
    expect(screen.getByText(/· vos/)).toBeInTheDocument()
  })
})
