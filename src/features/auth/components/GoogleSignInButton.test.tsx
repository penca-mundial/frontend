import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton'

const originalLocation = window.location

beforeEach(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { href: '' },
  })
})

afterEach(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalLocation,
  })
})

describe('GoogleSignInButton', () => {
  it('redirects to the backend Google OAuth endpoint on click', async () => {
    const user = userEvent.setup()
    render(<GoogleSignInButton />)

    await user.click(
      screen.getByRole('button', { name: /Continuar con Google/i }),
    )

    expect(window.location.href).toContain('/users/auth/google_oauth2')
  })

  it('supports a custom label', () => {
    render(<GoogleSignInButton label="Registrarte con Google" />)
    expect(
      screen.getByRole('button', { name: 'Registrarte con Google' }),
    ).toBeInTheDocument()
  })
})
