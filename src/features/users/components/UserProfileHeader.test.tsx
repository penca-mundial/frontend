import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { UserProfileHeader } from '@/features/users/components/UserProfileHeader'
import type { PublicProfileUser } from '@/features/users/types'

const user: PublicProfileUser = {
  id: '42',
  username: 'leo',
  avatarUrl: null,
}

describe('UserProfileHeader', () => {
  it('shows the username (bare) as the banner heading', () => {
    render(<UserProfileHeader user={user} />)

    expect(
      screen.getByRole('heading', { level: 1, name: /leo/ }),
    ).toBeInTheDocument()
  })

  it('does not repeat the global standing (it lives in Pencas en común)', () => {
    render(<UserProfileHeader user={user} />)
    expect(screen.queryByText(/de \d+ ·/)).not.toBeInTheDocument()
    expect(screen.queryByText(/pts/)).not.toBeInTheDocument()
  })

  it('marks the viewer own profile with "· vos"', () => {
    render(<UserProfileHeader user={user} isMe />)
    expect(screen.getByText(/· vos/)).toBeInTheDocument()
  })
})
