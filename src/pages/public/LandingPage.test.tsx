import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LandingPage } from '@/pages/public/LandingPage'

function renderLanding() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )
}

describe('LandingPage', () => {
  it('renders the hero and every section', () => {
    renderLanding()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Tu penca del Mundial/i,
    )
    expect(screen.getByText('Cómo funciona')).toBeInTheDocument()
    expect(screen.getByText('Sumate gratis')).toBeInTheDocument()
    expect(screen.getByText('Hacé tus pronósticos')).toBeInTheDocument()
    expect(screen.getByText('Competí y ganá')).toBeInTheDocument()
    expect(
      screen.getByText(/Cómo se reparten los puntos/i),
    ).toBeInTheDocument()
    // Phase multipliers from the seed are listed.
    expect(screen.getByText('Dieciseisavos')).toBeInTheDocument()
    expect(screen.getByText('×4.0')).toBeInTheDocument()
    expect(screen.getByText(/Sumate ahora/i)).toBeInTheDocument()
  })

  it('points every CTA at /signup or /login', () => {
    renderLanding()

    // All "Crear cuenta"/"Crear cuenta gratis" CTAs go to /signup.
    const signupLinks = screen.getAllByRole('link', { name: /Crear cuenta/i })
    expect(signupLinks.length).toBeGreaterThanOrEqual(2)
    for (const link of signupLinks) {
      expect(link).toHaveAttribute('href', '/signup')
    }

    expect(screen.getByRole('link', { name: 'Ingresar' })).toHaveAttribute(
      'href',
      '/login',
    )
    expect(
      screen.getByRole('link', { name: 'Ya tengo cuenta' }),
    ).toHaveAttribute('href', '/login')
  })
})
