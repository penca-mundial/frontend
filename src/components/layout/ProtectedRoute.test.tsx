import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useSearchParams } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'

vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}))
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

const useCurrentUserMock = vi.mocked(useCurrentUser)

function LoginProbe() {
  const [params] = useSearchParams()
  return <div>LOGIN returnTo={params.get('returnTo') ?? '(none)'}</div>
}

function renderAt(entry: string) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/app/groups/join" element={<div>JOIN PAGE</div>} />
        </Route>
        <Route path="/login" element={<LoginProbe />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => vi.clearAllMocks())

describe('ProtectedRoute', () => {
  it('redirects a logged-out user to /login carrying the returnTo', () => {
    useCurrentUserMock.mockReturnValue({
      currentUser: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useCurrentUser>)

    renderAt('/app/groups/join?code=PIZZA124')

    expect(screen.getByText(/LOGIN returnTo=/)).toHaveTextContent(
      'returnTo=/app/groups/join?code=PIZZA124',
    )
  })

  it('renders the protected content for an authed user', () => {
    useCurrentUserMock.mockReturnValue({
      currentUser: { id: '1' },
      isLoading: false,
    } as unknown as ReturnType<typeof useCurrentUser>)

    renderAt('/app/groups/join?code=PIZZA124')

    expect(screen.getByText('JOIN PAGE')).toBeInTheDocument()
  })
})
