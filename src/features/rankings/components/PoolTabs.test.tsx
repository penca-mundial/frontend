import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PoolTabs } from '@/features/rankings/components/PoolTabs'
import type { Group } from '@/types/domain'

function group(overrides: Partial<Group> & { id: string }): Group {
  return {
    name: `Penca ${overrides.id}`,
    description: null,
    isGeneralPool: false,
    code: 'ABCD1234',
    memberCount: 5,
    isOwner: false,
    createdAt: '2026-06-01T00:00:00Z',
    ownerUsername: null,
    ...overrides,
  }
}

const GROUPS: Group[] = [
  group({ id: '1', isGeneralPool: true, name: 'Mundial 2026', memberCount: 1247 }),
  group({ id: '7', name: 'Los Cracks', memberCount: 14 }),
]

describe('PoolTabs', () => {
  it('renders "Pool general" first (fixed copy) with its member count, then the private pencas', () => {
    render(<PoolTabs groups={GROUPS} value="global" onChange={() => {}} />)

    const pills = screen.getAllByRole('button')
    expect(pills[0]).toHaveTextContent('Pool general')
    expect(pills[0]).toHaveTextContent('1.247')
    expect(pills[1]).toHaveTextContent('Los Cracks')
    expect(pills[1]).toHaveTextContent('14')
  })

  it('marks the selected pill with aria-pressed', () => {
    render(<PoolTabs groups={GROUPS} value="7" onChange={() => {}} />)

    expect(screen.getByRole('button', { name: /Pool general/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByRole('button', { name: /Los Cracks/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it("emits 'global' for the general pool and the group id for a private penca", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PoolTabs groups={GROUPS} value="global" onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: /Los Cracks/ }))
    expect(onChange).toHaveBeenCalledWith('7')

    await user.click(screen.getByRole('button', { name: /Pool general/ }))
    expect(onChange).toHaveBeenCalledWith('global')
  })
})
