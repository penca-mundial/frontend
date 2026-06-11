import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AvatarUploader } from '@/features/users/components/AvatarUploader'

describe('AvatarUploader', () => {
  it('shows initials when there is no avatar', () => {
    render(<AvatarUploader avatarUrl={null} username="santi" email="s@p.dev" />)
    expect(screen.getByText('SA')).toBeInTheDocument()
  })

  it('renders the photo when an avatar url is present', () => {
    render(
      <AvatarUploader
        avatarUrl="https://cdn/9.png"
        username="santi"
        email="s@p.dev"
      />,
    )
    expect(document.querySelector('img')).toHaveAttribute(
      'src',
      'https://cdn/9.png',
    )
  })

  it('is display-only: no upload control or change-photo affordance', () => {
    render(<AvatarUploader avatarUrl={null} username="santi" email="s@p.dev" />)
    expect(document.querySelector('input[type="file"]')).toBeNull()
    expect(
      screen.queryByRole('button', { name: 'Cambiar foto de perfil' }),
    ).not.toBeInTheDocument()
  })
})
