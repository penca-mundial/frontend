import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { server } from '@/test/mocks/server'
import { authApi, getApiError } from '@/api/auth.api'
import { navigation } from '@/api/client'
import type { ApiErrorResponse, AuthUserResponse } from '@/types/api'

const userResponse: AuthUserResponse = {
  id: 'user-1',
  email: 'sosa@example.com',
  username: 'sosa',
  admin: false,
  avatar_url: null,
  timezone: 'America/Montevideo',
  confirmed_at: '2026-01-01T00:00:00Z',
}

function errorBody(code: string, message: string): ApiErrorResponse {
  return { error: { code, message } }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('authApi.login', () => {
  it('posts credentials and returns the mapped user', async () => {
    server.use(
      http.post('*/auth/login', async ({ request }) => {
        expect(await request.json()).toEqual({
          email: 'sosa@example.com',
          password: 'secret123',
        })
        return HttpResponse.json({ user: userResponse })
      }),
    )

    const user = await authApi.login({
      email: 'sosa@example.com',
      password: 'secret123',
    })

    expect(user).toEqual({
      id: 'user-1',
      email: 'sosa@example.com',
      username: 'sosa',
      isAdmin: false,
      avatarUrl: null,
      timezone: 'America/Montevideo',
      confirmedAt: '2026-01-01T00:00:00Z',
      needsUsername: false,
    })
  })

  it('rejects on invalid credentials and surfaces the error code', async () => {
    // A 401 on a non-probe path makes the client redirect to /login; stub it
    // so the test exercises the API layer without jsdom navigation noise.
    vi.spyOn(navigation, 'redirectToLogin').mockImplementation(() => {})
    server.use(
      http.post('*/auth/login', () =>
        HttpResponse.json(
          errorBody('invalid_credentials', 'Email o contraseña inválidos.'),
          { status: 401 },
        ),
      ),
    )

    const error = await authApi
      .login({ email: 'sosa@example.com', password: 'wrong' })
      .catch((e: unknown) => e)

    expect(getApiError(error)?.code).toBe('invalid_credentials')
  })
})

describe('authApi.signup', () => {
  it('posts the payload and maps the created user', async () => {
    server.use(
      http.post('*/auth/signup', async ({ request }) => {
        expect(await request.json()).toEqual({
          email: 'new@example.com',
          password: 'secret123',
          username: 'newbie',
        })
        return HttpResponse.json(
          { user: { ...userResponse, email: 'new@example.com', admin: true } },
          { status: 201 },
        )
      }),
    )

    const user = await authApi.signup({
      email: 'new@example.com',
      password: 'secret123',
      username: 'newbie',
    })

    expect(user.email).toBe('new@example.com')
    expect(user.isAdmin).toBe(true)
  })

  it('exposes validation details on a 422', async () => {
    server.use(
      http.post('*/auth/signup', () =>
        HttpResponse.json(
          {
            error: {
              code: 'validation_error',
              message: 'Datos inválidos.',
              details: { errors: ['Email ya está en uso'] },
            },
          },
          { status: 422 },
        ),
      ),
    )

    const error = await authApi
      .signup({
        email: 'taken@example.com',
        password: 'secret123',
        username: 'x',
      })
      .catch((e: unknown) => e)

    const apiError = getApiError(error)
    expect(apiError?.code).toBe('validation_error')
    expect(apiError?.details?.errors).toEqual(['Email ya está en uso'])
  })
})

describe('authApi.logout', () => {
  it('sends DELETE and resolves', async () => {
    server.use(
      http.delete(
        '*/auth/logout',
        () => new HttpResponse(null, { status: 204 }),
      ),
    )
    await expect(authApi.logout()).resolves.toBeUndefined()
  })
})

describe('authApi.requestPasswordReset', () => {
  it('posts the email and resolves on 202', async () => {
    server.use(
      http.post('*/auth/password', async ({ request }) => {
        expect(await request.json()).toEqual({ email: 'sosa@example.com' })
        return new HttpResponse(null, { status: 202 })
      }),
    )
    await expect(
      authApi.requestPasswordReset({ email: 'sosa@example.com' }),
    ).resolves.toBeUndefined()
  })
})

describe('authApi.resetPassword', () => {
  it('puts the token and password and returns the user', async () => {
    server.use(
      http.put('*/auth/password', async ({ request }) => {
        expect(await request.json()).toEqual({
          reset_password_token: 'tok-123',
          password: 'brandnew123',
        })
        return HttpResponse.json({ user: userResponse })
      }),
    )

    const user = await authApi.resetPassword({
      reset_password_token: 'tok-123',
      password: 'brandnew123',
    })
    expect(user.username).toBe('sosa')
  })

  it('surfaces token_expired on a 400', async () => {
    server.use(
      http.put('*/auth/password', () =>
        HttpResponse.json(errorBody('token_expired', 'El link expiró.'), {
          status: 400,
        }),
      ),
    )

    const error = await authApi
      .resetPassword({ reset_password_token: 'old', password: 'brandnew123' })
      .catch((e: unknown) => e)
    expect(getApiError(error)?.code).toBe('token_expired')
  })
})

describe('authApi.confirmEmail', () => {
  it('GETs the confirmation endpoint with the token as a query param', async () => {
    server.use(
      http.get('*/auth/confirmation', ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('confirmation_token')).toBe('confirm-tok')
        return HttpResponse.json({})
      }),
    )
    await expect(authApi.confirmEmail('confirm-tok')).resolves.toBeUndefined()
  })
})

describe('authApi.resendConfirmation', () => {
  it('posts the email and resolves on 202', async () => {
    server.use(
      http.post('*/auth/confirmation', async ({ request }) => {
        expect(await request.json()).toEqual({ email: 'sosa@example.com' })
        return new HttpResponse(null, { status: 202 })
      }),
    )
    await expect(
      authApi.resendConfirmation({ email: 'sosa@example.com' }),
    ).resolves.toBeUndefined()
  })
})

describe('authApi.getMe', () => {
  it('returns the mapped user, deriving needsUsername from the response', async () => {
    server.use(
      http.get('*/auth/me', () =>
        HttpResponse.json({
          user: { ...userResponse, username: null, needs_username: true },
        }),
      ),
    )

    const user = await authApi.getMe()
    expect(user?.username).toBeNull()
    expect(user?.needsUsername).toBe(true)
  })

  it('returns null when there is no session (401)', async () => {
    server.use(
      http.get('*/auth/me', () => new HttpResponse(null, { status: 401 })),
    )
    await expect(authApi.getMe()).resolves.toBeNull()
  })

  it('rethrows non-401 errors', async () => {
    server.use(
      http.get('*/auth/me', () => new HttpResponse(null, { status: 500 })),
    )
    await expect(authApi.getMe()).rejects.toBeDefined()
  })
})

describe('getApiError', () => {
  it('returns null for non-axios errors', () => {
    expect(getApiError(new Error('boom'))).toBeNull()
  })
})
