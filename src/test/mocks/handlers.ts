import type { RequestHandler } from 'msw'

// No request handlers yet — feature tests register their own mocks
// (e.g. `server.use(http.get(...))`) as they cover real endpoints.
export const handlers: RequestHandler[] = []
