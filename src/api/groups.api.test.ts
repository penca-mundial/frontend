import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { groupsApi } from '@/api/groups.api'

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
