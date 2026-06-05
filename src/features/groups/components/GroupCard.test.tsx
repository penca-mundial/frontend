import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { GroupCard } from '@/features/groups/components/GroupCard'
import type { Group } from '@/types/domain'

function makeGroup(overrides: Partial<Group> = {}): Group {
  return {
    id: '7',
    name: 'Los Cracks',
    description: null,
    isGeneralPool: false,
    code: 'ABC123',
    memberCount: 12,
    isOwner: false,
    createdAt: '2026-06-01T00:00:00Z',
    ...overrides,
  }
}

function renderCard(group: Group) {
  return render(
    <MemoryRouter>
      <GroupCard group={group} />
    </MemoryRouter>,
  )
}

describe('GroupCard', () => {
  it('shows the name and member count and links to the detail', () => {
    renderCard(makeGroup())

    expect(screen.getByText('Los Cracks')).toBeInTheDocument()
    expect(screen.getByText('12 miembros')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Ver Los Cracks/ }),
    ).toHaveAttribute('href', '/app/groups/7')
  })

  it('singularises a single member', () => {
    renderCard(makeGroup({ memberCount: 1 }))
    expect(screen.getByText('1 miembro')).toBeInTheDocument()
  })

  it('shows the General badge for the general pool', () => {
    renderCard(makeGroup({ isGeneralPool: true, name: 'Mundial 2026' }))
    expect(screen.getByText('General')).toBeInTheDocument()
  })

  it('shows the owner badge when the user owns the group', () => {
    renderCard(makeGroup({ isOwner: true }))
    expect(screen.getByText('Creador')).toBeInTheDocument()
  })

  it('omits the badges for a plain private group', () => {
    renderCard(makeGroup())
    expect(screen.queryByText('General')).not.toBeInTheDocument()
    expect(screen.queryByText('Creador')).not.toBeInTheDocument()
  })
})
