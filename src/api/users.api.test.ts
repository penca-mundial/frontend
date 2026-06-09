import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { usersApi } from '@/api/users.api'

describe('usersApi.updateProfile', () => {
  it('PATCHes /users/me with the camelCase→snake_case payload and maps the user', async () => {
    let method: string | null = null
    let bodyJson: Record<string, unknown> | null = null
    server.use(
      http.patch('*/users/me', async ({ request }) => {
        method = request.method
        bodyJson = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          user: {
            id: 9,
            email: 'santi@penca.dev',
            username: 'santi',
            admin: false,
            avatar_url: 'https://cdn/9.png',
            timezone: 'UTC',
            confirmed_at: '2026-01-01T00:00:00Z',
            provider: 'google_oauth2',
            created_at: '2026-03-15T00:00:00Z',
          },
        })
      }),
    )

    const user = await usersApi.updateProfile({
      username: 'santi',
      avatarUrl: 'https://cdn/9.png',
    })

    expect(method).toBe('PATCH')
    expect(bodyJson).toEqual({ username: 'santi', avatar_url: 'https://cdn/9.png' })
    expect(user).toMatchObject({
      id: '9', // normalized to string (ADR 0004)
      username: 'santi',
      avatarUrl: 'https://cdn/9.png',
      isAdmin: false,
      provider: 'google_oauth2',
      createdAt: '2026-03-15T00:00:00Z',
    })
  })

  it('degrades provider/createdAt to null when the backend omits them', async () => {
    server.use(
      http.patch('*/users/me', () =>
        HttpResponse.json({
          user: {
            id: 9,
            email: 'santi@penca.dev',
            username: 'santi',
            admin: false,
            avatar_url: null,
            timezone: 'UTC',
            confirmed_at: null,
          },
        }),
      ),
    )

    const user = await usersApi.updateProfile({ username: 'santi' })
    expect(user.provider).toBeNull()
    expect(user.createdAt).toBeNull()
  })

  it('omits keys that are not provided (no timezone is ever sent)', async () => {
    let bodyJson: Record<string, unknown> | null = null
    server.use(
      http.patch('*/users/me', async ({ request }) => {
        bodyJson = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          user: {
            id: 9,
            email: 'santi@penca.dev',
            username: 'santi',
            admin: false,
            avatar_url: null,
            timezone: 'UTC',
            confirmed_at: null,
          },
        })
      }),
    )

    await usersApi.updateProfile({ avatarUrl: 'https://cdn/x.png' })
    expect(bodyJson).toEqual({ avatar_url: 'https://cdn/x.png' })
    expect(bodyJson).not.toHaveProperty('timezone')
    expect(bodyJson).not.toHaveProperty('username')
  })
})
