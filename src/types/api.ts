/** Standard error envelope returned by the backend. */
export interface ApiError {
  error: string
  message: string
  details?: Record<string, string[]>
}

/** Generic paginated list response. */
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    perPage: number
    totalPages: number
    totalCount: number
  }
}
