import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import type { ReactNode } from 'react'
import { server } from '@/test/mocks/server'
import { useTeams } from '@/features/tournament-predictions/hooks/useTeams'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

describe('useTeams', () => {
  it('does not fetch until a tournament id is provided', () => {
    const { result } = renderHook(() => useTeams(undefined), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })

  it('fetches and maps teams once a tournament id is present', async () => {
    server.use(
      http.get('*/teams', () =>
        HttpResponse.json([
          { id: 1, name: 'Uruguay', code3: 'URU', flag_url: null },
        ]),
      ),
    )

    const { result } = renderHook(() => useTeams('1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([
      { id: '1', name: 'Uruguay', code3: 'URU', flagUrl: null },
    ])
  })
})
