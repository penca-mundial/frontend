import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AccountSection } from '@/features/users/components/AccountSection'

function renderWith(provider: string | null | undefined) {
  return render(
    <MemoryRouter>
      <AccountSection provider={provider} />
    </MemoryRouter>,
  )
}

describe('AccountSection', () => {
  it('shows the password row with a change-password action for password accounts', () => {
    renderWith(null)
    expect(screen.getByText('Contraseña')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /Contraseña/ })
    expect(link).toHaveAttribute('href', '/forgot-password')
    // No Google row, no invented "changed N days ago".
    expect(screen.queryByText('Google')).not.toBeInTheDocument()
    expect(screen.queryByText(/hace \d+ días/i)).not.toBeInTheDocument()
  })

  it('shows a linked-Google row (Conectado) and hides the password row for OAuth accounts', () => {
    renderWith('google_oauth2')
    expect(screen.getByText('Google')).toBeInTheDocument()
    expect(screen.getByText('Conectado')).toBeInTheDocument()
    expect(screen.queryByText('Contraseña')).not.toBeInTheDocument()
  })

  it('degrades to the password row when the provider field is absent', () => {
    renderWith(undefined)
    expect(screen.getByText('Contraseña')).toBeInTheDocument()
    expect(screen.queryByText('Google')).not.toBeInTheDocument()
  })

  it('does NOT render a logout button (logout lives in the header menu)', () => {
    renderWith(null)
    expect(
      screen.queryByRole('button', { name: 'Cerrar sesión' }),
    ).not.toBeInTheDocument()
  })
})
