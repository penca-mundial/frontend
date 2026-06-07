import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { PublicHeader } from '@/components/layout/PublicHeader'

function renderHeader() {
  return render(
    <MemoryRouter>
      <PublicHeader />
    </MemoryRouter>,
  )
}

describe('PublicHeader', () => {
  it('renders the logo linking home and the auth CTAs', () => {
    renderHeader()
    expect(
      screen.getByRole('link', { name: /Magic Penca/i }),
    ).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Ingresar' })).toHaveAttribute(
      'href',
      '/login',
    )
    expect(screen.getByRole('link', { name: 'Crear cuenta' })).toHaveAttribute(
      'href',
      '/signup',
    )
  })
})
