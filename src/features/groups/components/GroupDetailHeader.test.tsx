import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GroupDetailHeader } from '@/features/groups/components/GroupDetailHeader'
import type { Group } from '@/types/domain'

vi.mock('@/hooks/useToast', () => ({ toast: vi.fn() }))
// The management menu is tested separately; here we only assert it's gated.
vi.mock('@/features/groups/components/GroupManagementMenu', () => ({
  GroupManagementMenu: () => <div data-testid="mgmt-menu" />,
}))
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

afterEach(() => {
  delete (navigator as { share?: unknown }).share
  delete (window as { matchMedia?: unknown }).matchMedia
})

function setPointer(coarse: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: coarse,
  }) as unknown as typeof window.matchMedia
}

function stubShare() {
  const share = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'share', { value: share, configurable: true })
  return share
}

function stubClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  })
  return writeText
}

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
    expect(screen.getByText(/creada por messi/)).toBeInTheDocument()
    unmount()
    renderHeader(makeGroup({ ownerUsername: null }))
    expect(screen.queryByText(/creada por/)).not.toBeInTheDocument()
  })

  it('on desktop copies the invite LINK even if navigator.share exists', async () => {
    const user = userEvent.setup()
    setPointer(false) // fine pointer = desktop
    const share = stubShare()
    const writeText = stubClipboard()
    renderHeader(makeGroup())

    expect(screen.getByText('PIZZA124')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Compartir código/ }))

    expect(share).not.toHaveBeenCalled()
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('/app/groups/join?code=PIZZA124'),
    )
    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith({
        title: 'Link de invitación copiado',
      }),
    )
  })

  it('on touch devices shares the invite LINK via the native sheet', async () => {
    const user = userEvent.setup()
    setPointer(true) // coarse pointer = touch
    const share = stubShare()
    const writeText = stubClipboard()
    renderHeader(makeGroup())

    await user.click(screen.getByRole('button', { name: /Compartir código/ }))

    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/app/groups/join?code=PIZZA124'),
      }),
    )
    expect(writeText).not.toHaveBeenCalled()
  })

  it('hides the code and share action on the general pool', () => {
    renderHeader(makeGroup({ isGeneralPool: true, code: 'GENERAL0' }))
    expect(screen.queryByText('GENERAL0')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Compartir código/ }),
    ).not.toBeInTheDocument()
  })

  it('renders the management menu on a private penca but not on the general pool', () => {
    const { unmount } = renderHeader(makeGroup())
    expect(screen.getByTestId('mgmt-menu')).toBeInTheDocument()
    unmount()
    renderHeader(makeGroup({ isGeneralPool: true }))
    expect(screen.queryByTestId('mgmt-menu')).not.toBeInTheDocument()
  })
})
