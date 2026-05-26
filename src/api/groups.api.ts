import type { Group } from '@/types/domain'

// Stubs — implemented in feature tickets.
export const groupsApi = {
  list(): Promise<Group[]> {
    throw new Error('Not implemented')
  },
  get(): Promise<Group> {
    throw new Error('Not implemented')
  },
  create(): Promise<Group> {
    throw new Error('Not implemented')
  },
}
