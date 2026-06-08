import { describe, expect, it } from 'vitest'
import { resetPasswordSchema, signupSchema } from '@/features/auth/schemas'

const base = {
  email: 'new@example.com',
  username: 'sosa_10',
  passwordConfirm: '',
}

function signup(password: string) {
  return signupSchema.safeParse({
    ...base,
    password,
    passwordConfirm: password,
  })
}

describe('signupSchema password rules (mirror the backend, SCRUM-298/301)', () => {
  it('accepts 8+ chars with at least one digit', () => {
    expect(signup('secret123').success).toBe(true)
  })

  it('rejects fewer than 8 characters', () => {
    const result = signup('ab12')
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('Mínimo 8 caracteres.')
  })

  it('rejects a password without a digit', () => {
    const result = signup('onlyletters')
    expect(result.success).toBe(false)
    expect(result.error?.issues.some((i) => /número/.test(i.message))).toBe(true)
  })

  it('rejects more than 128 characters (server caps at 128)', () => {
    // 130 chars including a digit — long enough to trip the server's 8..128.
    const tooLong = 'a1'.repeat(65)
    expect(tooLong.length).toBe(130)
    expect(signup(tooLong).success).toBe(false)
  })

  it('accepts exactly 128 characters', () => {
    const exact = 'a1'.repeat(64)
    expect(exact.length).toBe(128)
    expect(signup(exact).success).toBe(true)
  })
})

describe('resetPasswordSchema shares the same rules', () => {
  it('rejects more than 128 characters', () => {
    const tooLong = 'a1'.repeat(65)
    const result = resetPasswordSchema.safeParse({
      password: tooLong,
      passwordConfirm: tooLong,
    })
    expect(result.success).toBe(false)
  })
})
