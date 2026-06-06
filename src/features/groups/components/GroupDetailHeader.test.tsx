import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GroupDetailHeader } from '@/features/groups/components/GroupDetailHeader'
import type { Group } from '@/types/domain'

vi.mock('@/hooks/useToast', () => ({ toast: vi.fn() }))
import { toast } from '@/hooks/useToast'

const toastMock = vi.mocked(toast)

function makeGroup(overrides: Partial<Group> = {}): Group {
  return {
    id: '7',
    name: 'Los Cracks',
    description: 'Los pibes de siempre',
    isGeneralPool: false,
    code: 'PIZZA124',
    memberCount: 14,
    isOwner: false,
    createdAt: '2026-06-06T00:00:00Z',
    ownerUsername: null,
    ...overrides,
  }
}

function renderHeader(group: Group) {
  return render(
    <MemoryRouter>
      <GroupDetailHeader group={group} />
    </MemoryRouter>,
  )
}

beforeEach(() => vi.clearAllMocks())

describe('GroupDetailHeader', () => {
  it('renders name, description, member count and a back link', () => {
    renderHeader(makeGroup())
    expect(screen.getByRole('heading', { name: 'Los Cracks' })).toBeInTheDocument()
    expect(screen.getByText('Los pibes de siempre')).toBeInTheDocument()
    expect(screen.getByText(/14 miembros/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Volver/ })).toHaveAttribute(
      'href',
      '/app/groups',
    )
  })

  it('shows the owner badge only when the user owns the group', () => {
    const { unmount } = renderHeader(makeGroup({ isOwner: true }))
    expect(screen.getByText('owner')).toBeInTheDocument()
    unmount()
    renderHeader(makeGroup({ isOwner: false }))
    expect(screen.queryByText('owner')).not.toBeInTheDocument()
  })

  it('shows "creada por @x" only when the creator is known', () => {
    const { unmount } = renderHeader(makeGroup({ ownerUsername: 'messi' }))
    expect(screen.getByText(/creada por @messi/)).toBeInTheDocument()
    unmount()
    renderHeader(makeGroup({ ownerUsername: null }))
    expect(screen.queryByText(/creada por/)).not.toBeInTheDocument()
  })

  it('shows the code + share on private pencas and copies as a fallback', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    // No navigator.share in jsdom → the fallback (copy) path runs.
    renderHeader(makeGroup())

    expect(screen.getByText('PIZZA124')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Compartir código/ }))

    expect(writeText).toHaveBeenCalledWith('PIZZA124')
    await waitFor(() => expect(toastMock).toHaveBeenCalled())
  })

  it('hides the code and share action on the general pool', () => {
    renderHeader(makeGroup({ isGeneralPool: true, code: 'GENERAL0' }))
    expect(screen.queryByText('GENERAL0')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Compartir código/ }),
    ).not.toBeInTheDocument()
  })
})
