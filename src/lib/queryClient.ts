import { QueryClient } from '@tanstack/react-query'

/** Shared TanStack Query client for the app's server state. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})
