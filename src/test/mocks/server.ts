import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// MSW server used by the Vitest setup file for all unit/integration tests.
export const server = setupServer(...handlers)
