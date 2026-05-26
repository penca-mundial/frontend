import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { type ReactNode } from 'react'
import { server } from '@/test/mocks/server'
import { AuthProvider, type CurrentUser } from '@/contexts/AuthContext'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

const user: CurrentUser = {
  id: '1',
  email: 'neo@matrix.dev',
  username: 'neo',
  isAdmin: false,
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

  it('returns the user when /auth/me responds 200', async () => {
    server.use(http.get('*/auth/me', () => HttpResponse.json(user)))

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.currentUser).toEqual(user))
  })

  it('logout() calls DELETE /auth/logout and clears state', async () => {
    let logoutCalled = false
    server.use(
      http.get('*/auth/me', () => HttpResponse.json(user)),
      http.delete('*/auth/logout', () => {
        logoutCalled = true
        return new HttpResponse(null, { status: 204 })
      }),
    )

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.currentUser).toEqual(user))

    await act(async () => {
      await result.current.logout()
    })

    expect(logoutCalled).toBe(true)
    await waitFor(() => expect(result.current.currentUser).toBeNull())
  })
})
