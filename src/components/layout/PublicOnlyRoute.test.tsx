import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PublicOnlyRoute } from '@/components/layout/PublicOnlyRoute'

vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}))
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

const useCurrentUserMock = vi.mocked(useCurrentUser)

function setAuth(authed: boolean) {
  useCurrentUserMock.mockReturnValue({
    currentUser: authed ? { id: '1' } : null,
    isLoading: false,
  } as unknown as ReturnType<typeof useCurrentUser>)
}

function renderAt(entry: string) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<div>LOGIN</div>} />
        </Route>
        <Route path="/app/home" element={<div>HOME</div>} />
        <Route path="/app/groups/join" element={<div>JOIN PAGE</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => vi.clearAllMocks())

describe('PublicOnlyRoute', () => {
  it('shows the public page when logged out', () => {
    setAuth(false)
    renderAt('/login')
    expect(screen.getByText('LOGIN')).toBeInTheDocument()
  })

  it('sends an authed user to /app/home by default', () => {
    setAuth(true)
    renderAt('/login')
    expect(screen.getByText('HOME')).toBeInTheDocument()
  })

  it('sends an authed user to the returnTo when present', () => {
    setAuth(true)
    renderAt('/login?returnTo=%2Fapp%2Fgroups%2Fjoin%3Fcode%3DX')
    expect(screen.getByText('JOIN PAGE')).toBeInTheDocument()
  })
})
