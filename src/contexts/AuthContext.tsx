import { createContext, useCallback, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/api/auth.api'
import type { AuthUser } from '@/features/auth/types'

/**
 * The authenticated user as exposed to the app: the mapped `AuthUser` returned
 * by `authApi.getMe()` (camelCase, with `needsUsername`). `CurrentUser` is kept
 * as an alias for the call sites that already import it.
 */
export type CurrentUser = AuthUser

export interface AuthContextValue {
  currentUser: CurrentUser | null
  isLoading: boolean
  refetch: () => void
  logout: () => Promise<void>
}

export const AUTH_ME_KEY = ['auth', 'me'] as const

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: AUTH_ME_KEY,
    // getMe() resolves to null on a 401 (no active session) and only throws on
    // unexpected errors, so the query data is `AuthUser | null`.
    queryFn: () => authApi.getMe(),
    retry: false,
    staleTime: Infinity,
  })

  const refetch = useCallback(() => {
    void query.refetch()
  }, [query])

  const logout = useCallback(async () => {
    await authApi.logout()
    queryClient.setQueryData(AUTH_ME_KEY, null)
  }, [queryClient])

  const value: AuthContextValue = {
    currentUser: query.data ?? null,
    isLoading: query.isLoading,
    refetch,
    logout,
  }

  return <AuthContext value={value}>{children}</AuthContext>
}
