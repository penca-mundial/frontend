import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton'

describe('GoogleSignInButton', () => {
  it('renders a POST form targeting the backend Google OAuth initiate route', () => {
    const { container } = render(<GoogleSignInButton />)

    const form = container.querySelector('form')
    expect(form).not.toBeNull()
    expect(form?.method).toBe('post')
    expect(form?.getAttribute('action')).toContain('/users/auth/google_oauth2')
  })

  it('submits via a submit button with the default label', () => {
    render(<GoogleSignInButton />)
    const button = screen.getByRole('button', { name: /Continuar con Google/i })
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('supports a custom label', () => {
    render(<GoogleSignInButton label="Registrarte con Google" />)
    expect(
      screen.getByRole('button', { name: 'Registrarte con Google' }),
    ).toBeInTheDocument()
  })
})
