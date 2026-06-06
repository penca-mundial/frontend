import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { groupsApi } from '@/api/groups.api'

describe('groupsApi.members', () => {
  it('GETs a page, reads X-Total-Count and maps the nested user', async () => {
    let params: URLSearchParams | null = null
    server.use(
      http.get('*/groups/7/members', ({ request }) => {
        params = new URL(request.url).searchParams
        return HttpResponse.json(
          [
            {
              joined_at: '2026-06-01T00:00:00Z',
              is_owner: true,
              user: { id: 1, username: 'leo', avatar_url: 'https://a/1.png' },
            },
            {
              joined_at: '2026-06-02T00:00:00Z',
              is_owner: false,
              user: { id: 2, username: 'fede', avatar_url: null },
            },
          ],
          { headers: { 'X-Total-Count': '37' } },
        )
      }),
    )

    const result = await groupsApi.members('7', 2)

    expect(params!.get('page')).toBe('2')
    expect(params!.get('per_page')).toBe('25')
    expect(result.totalCount).toBe(37)
    expect(result.members[0]).toEqual({
      userId: '1',
      username: 'leo',
      avatarUrl: 'https://a/1.png',
      isOwner: true,
      joinedAt: '2026-06-01T00:00:00Z',
    })
    expect(result.members[1].userId).toBe('2')
  })
})

describe('groupsApi.create', () => {
  it('POSTs name + description and maps the created group to camelCase', async () => {
    let body: unknown = null
    server.use(
      http.post('*/groups', async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(
          {
            id: 5,
            name: 'Los Cracks',
            description: 'Los pibes',
            code: 'ABC12345',
            is_general_pool: false,
            member_count: 1,
            is_owner: true,
            created_at: '2026-06-06T00:00:00Z',
          },
          { status: 201 },
        )
      }),
    )

    const group = await groupsApi.create({
      name: 'Los Cracks',
      description: 'Los pibes',
    })

    expect(body).toEqual({ name: 'Los Cracks', description: 'Los pibes' })
    expect(group).toMatchObject({
      id: '5',
      name: 'Los Cracks',
      description: 'Los pibes',
      isGeneralPool: false,
      code: 'ABC12345',
      memberCount: 1,
      isOwner: true,
    })
  })
})

describe('groupsApi.get', () => {
  it('GETs /groups/:id and maps it (ownerUsername null when absent)', async () => {
    server.use(
      http.get('*/groups/7', () =>
        HttpResponse.json({
          id: 7,
          name: 'Los Cracks',
          description: 'Los pibes',
          code: 'PIZZA124',
          is_general_pool: false,
          member_count: 14,
          is_owner: true,
          created_at: '2026-06-06T00:00:00Z',
        }),
      ),
    )

    const group = await groupsApi.get('7')
    expect(group).toMatchObject({
      id: '7',
      name: 'Los Cracks',
      memberCount: 14,
      isOwner: true,
      ownerUsername: null,
    })
  })

  it('maps owner_username when the backend provides it', async () => {
    server.use(
      http.get('*/groups/7', () =>
        HttpResponse.json({
          id: 7,
          name: 'Los Cracks',
          description: null,
          code: 'PIZZA124',
          is_general_pool: false,
          member_count: 1,
          is_owner: false,
          created_at: '2026-06-06T00:00:00Z',
          owner_username: 'messi',
        }),
      ),
    )

    expect((await groupsApi.get('7')).ownerUsername).toBe('messi')
  })
})

describe('groupsApi.join', () => {
  it('POSTs the code and maps the joined group to camelCase', async () => {
    let body: unknown = null
    server.use(
      http.post('*/groups/join', async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(
          {
            id: 9,
            name: 'Los Cracks',
            description: null,
            code: 'PIZZA124',
            is_general_pool: false,
            member_count: 13,
            is_owner: false,
            created_at: '2026-06-06T00:00:00Z',
          },
          { status: 201 },
        )
      }),
    )

    const group = await groupsApi.join('PIZZA124')

    expect(body).toEqual({ code: 'PIZZA124' })
    expect(group).toMatchObject({
      id: '9',
      name: 'Los Cracks',
      code: 'PIZZA124',
      memberCount: 13,
      isOwner: false,
    })
  })
})
