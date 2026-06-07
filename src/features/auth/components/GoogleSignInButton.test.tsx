import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton'
import { takeReturnTo } from '@/features/auth/returnTo'

const INVITE = '/app/groups/join?code=PIZZA124'

function renderAt(entry = '/login') {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <GoogleSignInButton />
    </MemoryRouter>,
  )
}

afterEach(() => sessionStorage.clear())

describe('GoogleSignInButton', () => {
  it('renders a POST form targeting the backend Google OAuth initiate route', () => {
    const { container } = renderAt()
    const form = container.querySelector('form')
    expect(form).not.toBeNull()
    expect(form?.method).toBe('post')
    expect(form?.getAttribute('action')).toContain('/users/auth/google_oauth2')
  })

  it('submits via a submit button with the default label', () => {
    renderAt()
    const button = screen.getByRole('button', { name: /Continuar con Google/i })
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('supports a custom label', () => {
    render(
      <MemoryRouter>
        <GoogleSignInButton label="Registrarte con Google" />
      </MemoryRouter>,
    )
    expect(
      screen.getByRole('button', { name: 'Registrarte con Google' }),
    ).toBeInTheDocument()
  })

  it('stashes the returnTo before initiating OAuth', () => {
    renderAt(`/login?returnTo=${encodeURIComponent(INVITE)}`)
    fireEvent.submit(
      screen.getByRole('button', { name: /Google/ }).closest('form')!,
    )
    expect(takeReturnTo()).toBe(INVITE)
  })

  it('stashes nothing when there is no returnTo', () => {
    renderAt('/login')
    fireEvent.submit(
      screen.getByRole('button', { name: /Google/ }).closest('form')!,
    )
    expect(takeReturnTo()).toBeNull()
  })
})
