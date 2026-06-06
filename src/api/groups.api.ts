import { get, post } from '@/api/client'
import type { GroupResponse } from '@/types/api'
import type { Group } from '@/types/domain'

/** Body for creating a penca (`POST /groups`). */
export interface CreateGroupPayload {
  name: string
  description?: string | null
}

/** Map a backend (snake_case) group to the domain type. */
export function mapGroup(group: GroupResponse): Group {
  return {
    id: String(group.id),
    name: group.name,
    description: group.description,
    isGeneralPool: group.is_general_pool,
    code: group.code,
    memberCount: group.member_count,
    isOwner: group.is_owner,
    createdAt: group.created_at,
  }
}

export const groupsApi = {
  /**
   * The pencas the current user belongs to (`GET /groups/me`). The backend
   * lists the general tournament pool first, then the user's private groups;
   * we preserve that order and just map to camelCase.
   */
  async mine(): Promise<Group[]> {
    const data = await get<GroupResponse[]>('/groups/me')
    return data.map(mapGroup)
  },

  /**
   * Create a user-owned penca (`POST /groups`). The backend assigns the invite
   * code and adds the owner as the first member; we map the created group back.
   * Rejects with the axios error on validation failure (e.g. the owner's
   * 3-group limit) — callers read it via `getApiError`.
   */
  async create(payload: CreateGroupPayload): Promise<Group> {
    return mapGroup(await post<GroupResponse>('/groups', payload))
  },

  /**
   * Join a penca by its invite code (`POST /groups/join`). Idempotent on the
   * backend (already a member → returns the group untouched). Rejects with the
   * axios error on failure (invalid code, full group) — read via `getApiError`.
   */
  async join(code: string): Promise<Group> {
    return mapGroup(await post<GroupResponse>('/groups/join', { code }))
  },

  // Implemented by its feature ticket (SCRUM-148 detail).
  get(): Promise<Group> {
    throw new Error('Not implemented')
  },
}
