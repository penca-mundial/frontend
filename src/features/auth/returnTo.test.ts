import { afterEach, describe, expect, it } from 'vitest'
import {
  isSafeReturnTo,
  loginWithReturnTo,
  readReturnTo,
  stashReturnTo,
  takeReturnTo,
} from '@/features/auth/returnTo'

const INVITE = '/app/groups/join?code=PIZZA124'

afterEach(() => sessionStorage.clear())

describe('isSafeReturnTo', () => {
  it('accepts internal app paths', () => {
    expect(isSafeReturnTo('/app/groups/join?code=X')).toBe(true)
    expect(isSafeReturnTo('/app/home')).toBe(true)
  })

  it('rejects unsafe / external / non-app values', () => {
    expect(isSafeReturnTo(null)).toBe(false)
    expect(isSafeReturnTo('')).toBe(false)
    expect(isSafeReturnTo('/login')).toBe(false)
    expect(isSafeReturnTo('//evil.com')).toBe(false)
    expect(isSafeReturnTo('https://evil.com')).toBe(false)
    expect(isSafeReturnTo('/app//evil')).toBe(false)
  })
})

describe('readReturnTo', () => {
  it('reads and validates the returnTo query param', () => {
    expect(readReturnTo(`?returnTo=${encodeURIComponent(INVITE)}`)).toBe(INVITE)
    expect(readReturnTo('?returnTo=%2Flogin')).toBeNull()
    expect(readReturnTo('')).toBeNull()
  })
})

describe('loginWithReturnTo', () => {
  it('encodes a safe destination onto /login', () => {
    expect(loginWithReturnTo(INVITE)).toBe(
      `/login?returnTo=${encodeURIComponent(INVITE)}`,
    )
  })
  it('falls back to plain /login for unsafe targets', () => {
    expect(loginWithReturnTo('/login')).toBe('/login')
    expect(loginWithReturnTo('https://evil.com')).toBe('/login')
  })
})

describe('stashReturnTo / takeReturnTo', () => {
  it('round-trips a safe destination and clears it', () => {
    stashReturnTo(INVITE)
    expect(takeReturnTo()).toBe(INVITE)
    expect(takeReturnTo()).toBeNull() // consumed
  })

  it('ignores unsafe values', () => {
    stashReturnTo('https://evil.com')
    expect(takeReturnTo()).toBeNull()
  })
})
