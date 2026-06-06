import { apiClient, get, post } from '@/api/client'
import type { GroupMemberResponse, GroupResponse } from '@/types/api'
import type { Group, GroupMember } from '@/types/domain'

/** Body for creating a penca (`POST /groups`). */
export interface CreateGroupPayload {
  name: string
  description?: string | null
}

/** One page of a group's member list. */
export interface GroupMemberPage {
  members: GroupMember[]
  totalCount: number
  page: number
  perPage: number
}

/** Map a backend (snake_case) member row to the domain type. */
function mapMember(row: GroupMemberResponse): GroupMember {
  return {
    userId: String(row.user.id),
    username: row.user.username,
    avatarUrl: row.user.avatar_url,
    isOwner: row.is_owner,
    joinedAt: row.joined_at,
  }
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
    ownerUsername: group.owner_username ?? null,
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

  /** A single penca by id (`GET /groups/:id`, members only). */
  async get(groupId: string): Promise<Group> {
    return mapGroup(await get<GroupResponse>(`/groups/${groupId}`))
  },

  /**
   * A page of a penca's members (`GET /groups/:id/members`, members only).
   * The backend renders a bare array and exposes the total via `X-Total-Count`;
   * rows come ordered by join date.
   */
  async members(
    groupId: string,
    page = 1,
    perPage = 25,
  ): Promise<GroupMemberPage> {
    const response = await apiClient.get<GroupMemberResponse[]>(
      `/groups/${groupId}/members`,
      { params: { page, per_page: perPage } },
    )
    const total = response.headers['x-total-count']
    return {
      members: response.data.map(mapMember),
      totalCount: total ? Number(total) : response.data.length,
      page,
      perPage,
    }
  },
}
