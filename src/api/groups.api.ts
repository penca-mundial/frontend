import { get } from '@/api/client'
import type { GroupResponse } from '@/types/api'
import type { Group } from '@/types/domain'

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

  // Implemented by their feature tickets (SCRUM-146 create, 147 join, 148 detail).
  get(): Promise<Group> {
    throw new Error('Not implemented')
  },
  create(): Promise<Group> {
    throw new Error('Not implemented')
  },
}
