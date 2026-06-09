import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { type ReactNode } from 'react'
import { server } from '@/test/mocks/server'
import { AuthProvider } from '@/contexts/AuthContext'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import type { AuthUser } from '@/features/auth/types'

// Wire shape served by GET /auth/me (snake_case, wrapped in `user`).
const meResponse = {
  user: {
    id: '1',
    email: 'neo@matrix.dev',
    username: 'neo',
    admin: false,
    avatar_url: null,
    timezone: null,
    confirmed_at: '2026-01-01T00:00:00Z',
    needs_username: false,
  },
}

// The mapped AuthUser the context should expose.
const expectedUser: AuthUser = {
  id: '1',
  email: 'neo@matrix.dev',
  username: 'neo',
  isAdmin: false,
  avatarUrl: null,
  timezone: null,
  confirmedAt: '2026-01-01T00:00:00Z',
  needsUsername: false,
  // Optional fields degrade to null when /auth/me omits them (SCRUM-199).
  provider: null,
  createdAt: null,
}

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    )
  }
}

describe('AuthContext / useCurrentUser', () => {
  it('returns null when /auth/me responds 401', async () => {
    server.use(
      http.get('*/auth/me', () => new HttpResponse(null, { status: 401 })),
    )

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.currentUser).toBeNull()
  })

  it('returns the mapped user when /auth/me responds 200', async () => {
    server.use(http.get('*/auth/me', () => HttpResponse.json(meResponse)))

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: makeWrapper(),
    })

    await waitFor(() =>
      expect(result.current.currentUser).toEqual(expectedUser),
    )
  })

  it('logout() calls DELETE /auth/logout and clears state', async () => {
    let logoutCalled = false
    server.use(
      http.get('*/auth/me', () => HttpResponse.json(meResponse)),
      http.delete('*/auth/logout', () => {
        logoutCalled = true
        return new HttpResponse(null, { status: 204 })
      }),
    )

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: makeWrapper(),
    })

    await waitFor(() =>
      expect(result.current.currentUser).toEqual(expectedUser),
    )

    await act(async () => {
      await result.current.logout()
    })

    expect(logoutCalled).toBe(true)
    await waitFor(() => expect(result.current.currentUser).toBeNull())
  })
})
