import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { LandingPage } from '@/pages/public/LandingPage'
import { server } from '@/test/mocks/server'

// The landing now pulls its scoring section from GET /scoring_rules
// (SCRUM-296) — labels localized, multipliers as numbers.
const CONFIG = {
  scoring_rules: [
    { rule_type: 'exact_score', points: 10, label: 'Resultado exacto' },
    { rule_type: 'champion_correct', points: 50, label: 'Campeón acertado' },
  ],
  phase_multipliers: [
    { phase: 'round_of_32', multiplier: 1.5, label: 'Dieciseisavos de final' },
    { phase: 'final', multiplier: 4.0, label: 'Final' },
  ],
}

beforeEach(() => {
  server.use(http.get('*/scoring_rules', () => HttpResponse.json(CONFIG)))
})

function renderLanding() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('LandingPage', () => {
  it('renders the hero and every section', async () => {
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
    // The scoring section is now fed by the endpoint (labels + multipliers).
    expect(await screen.findByText('Dieciseisavos de final')).toBeInTheDocument()
    expect(screen.getByText('×4')).toBeInTheDocument()
    expect(screen.getByText(/Sumate ahora/i)).toBeInTheDocument()
  })

  it('points every CTA at /signup or /login', async () => {
    renderLanding()
    // Let the async scoring section settle so it doesn't warn mid-assert.
    await waitFor(() =>
      expect(screen.getByText('Dieciseisavos de final')).toBeInTheDocument(),
    )

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
