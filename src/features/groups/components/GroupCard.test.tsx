import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GroupCard } from '@/features/groups/components/GroupCard'
import type { Group } from '@/types/domain'

vi.mock('@/features/groups/hooks/useGroupRank', () => ({
  useGroupRank: vi.fn(),
}))
vi.mock('@/hooks/useToast', () => ({ toast: vi.fn() }))

import { useGroupRank } from '@/features/groups/hooks/useGroupRank'
import { toast } from '@/hooks/useToast'

const useGroupRankMock = vi.mocked(useGroupRank)
const toastMock = vi.mocked(toast)
let writeText: ReturnType<typeof vi.fn>

function makeGroup(overrides: Partial<Group> = {}): Group {
  return {
    id: '7',
    name: 'Los Cracks del Asado',
    description: 'Los pibes de siempre',
    isGeneralPool: false,
    code: 'PIZZA124',
    memberCount: 14,
    isOwner: false,
    createdAt: '2026-06-01T00:00:00Z',
    ...overrides,
  }
}

function mockRank(rank: number | null, isLoading = false) {
  useGroupRankMock.mockReturnValue({
    rankPosition: rank,
    isLoading,
    isError: false,
  } as unknown as ReturnType<typeof useGroupRank>)
}

function renderCard(group: Group) {
  return render(
    <MemoryRouter initialEntries={['/app/groups']}>
      <Routes>
        <Route path="/app/groups" element={<GroupCard group={group} />} />
        <Route path="/app/groups/:id" element={<div>DETALLE</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

/** Override navigator.clipboard with a spy. Call AFTER userEvent.setup(),
 *  which installs its own clipboard stub that would otherwise win. */
function stubClipboard() {
  writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockRank(3)
})

describe('GroupCard', () => {
  it('shows name, description, code, initials, rank and links to the detail', () => {
    renderCard(makeGroup())

    expect(screen.getByText('Los Cracks del Asado')).toBeInTheDocument()
    expect(screen.getByText('Los pibes de siempre')).toBeInTheDocument()
    expect(screen.getByText('PIZZA124')).toBeInTheDocument()
    expect(screen.getByText('LC')).toBeInTheDocument() // avatar initials
    expect(screen.getByText('3º')).toBeInTheDocument()
    expect(screen.getByText('de 14')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Ver Los Cracks/ }),
    ).toHaveAttribute('href', '/app/groups/7')
  })

  it('shows the owner badge when the user owns the group', () => {
    renderCard(makeGroup({ isOwner: true }))
    expect(screen.getByText('owner')).toBeInTheDocument()
  })

  it('omits the owner badge otherwise', () => {
    renderCard(makeGroup({ isOwner: false }))
    expect(screen.queryByText('owner')).not.toBeInTheDocument()
  })

  it('copies the invite code without navigating', async () => {
    const user = userEvent.setup()
    stubClipboard() // after setup(), so our spy wins over userEvent's stub
    renderCard(makeGroup())

    await user.click(screen.getByRole('button', { name: /Copiar código/ }))

    expect(writeText).toHaveBeenCalledWith('PIZZA124')
    await waitFor(() => expect(toastMock).toHaveBeenCalled())
    expect(screen.queryByText('DETALLE')).not.toBeInTheDocument()
  })

  it('navigates to the detail when the card link is activated', async () => {
    const user = userEvent.setup()
    renderCard(makeGroup())

    await user.click(screen.getByRole('link', { name: /Ver Los Cracks/ }))
    expect(screen.getByText('DETALLE')).toBeInTheDocument()
  })

  it('shows a subtle placeholder while the rank loads', () => {
    mockRank(null, true)
    renderCard(makeGroup())
    expect(screen.queryByText('3º')).not.toBeInTheDocument()
    expect(screen.getByText('de 14')).toBeInTheDocument() // layout intact
  })
})
