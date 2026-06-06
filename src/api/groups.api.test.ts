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
