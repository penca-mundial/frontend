import { createContext, useCallback, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { del, get } from '@/api/client'

/** Minimal shape of the authenticated user; refined by feature tickets. */
export interface CurrentUser {
  id: string
  email: string
  username: string | null
  isAdmin: boolean
}

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

async function fetchCurrentUser(): Promise<CurrentUser | null> {
  try {
    return await get<CurrentUser>('/auth/me')
  } catch (error) {
    // A 401 simply means there is no active session.
    if (isAxiosError(error) && error.response?.status === 401) {
      return null
    }
    throw error
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: AUTH_ME_KEY,
    queryFn: fetchCurrentUser,
    retry: false,
    staleTime: Infinity,
  })

  const refetch = useCallback(() => {
    void query.refetch()
  }, [query])

  const logout = useCallback(async () => {
    await del('/auth/logout')
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
