import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { server } from '@/test/mocks/server'
import { del, get, navigation, post } from '@/api/client'

describe('api client', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('forwards GET and returns the response body', async () => {
    server.use(http.get('*/ping', () => HttpResponse.json({ ok: true })))
    await expect(get<{ ok: boolean }>('/ping')).resolves.toEqual({ ok: true })
  })

  it('forwards POST with a JSON body', async () => {
    server.use(
      http.post('*/echo', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json(body)
      }),
    )
    await expect(post('/echo', { a: 1 })).resolves.toEqual({ a: 1 })
  })

  it('forwards DELETE', async () => {
    server.use(
      http.delete('*/item/1', () => new HttpResponse(null, { status: 204 })),
    )
    await expect(del('/item/1')).resolves.toBeDefined()
  })

  it('redirects to /login on a 401 response', async () => {
    const redirect = vi
      .spyOn(navigation, 'redirectToLogin')
      .mockImplementation(() => {})
    server.use(
      http.get('*/secret', () => new HttpResponse(null, { status: 401 })),
    )

    await expect(get('/secret')).rejects.toBeDefined()
    expect(redirect).toHaveBeenCalled()
  })
})
