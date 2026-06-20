import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SharedGroupsBlock } from '@/features/users/components/SharedGroupsBlock'
import type { ProfileSharedGroup } from '@/features/users/types'

const general: ProfileSharedGroup = {
  id: '1',
  name: 'Pool General',
  isGeneralPool: true,
  rankPosition: 7,
  points: 31,
  total: 128,
}

const privatePenca: ProfileSharedGroup = {
  id: '5',
  name: 'Los Amigos',
  isGeneralPool: false,
  rankPosition: 2,
  points: 31,
  total: 9,
}

describe('SharedGroupsBlock', () => {
  it('renders the general pool and each shared private penca with its standing', () => {
    render(<SharedGroupsBlock groups={[general, privatePenca]} />)

    expect(screen.getByText('Pool General')).toBeInTheDocument()
    expect(screen.getByText('General')).toBeInTheDocument() // general badge
    expect(screen.getByText('N.º 7 de 128')).toBeInTheDocument()
    expect(screen.getByText('Los Amigos')).toBeInTheDocument()
    expect(screen.getByText('N.º 2 de 9')).toBeInTheDocument()
  })

  it('renders even when only the general pool is shared', () => {
    render(<SharedGroupsBlock groups={[general]} />)
    expect(screen.getByText('Pool General')).toBeInTheDocument()
  })

  it('renders nothing when there are no shared groups at all', () => {
    const { container } = render(<SharedGroupsBlock groups={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
