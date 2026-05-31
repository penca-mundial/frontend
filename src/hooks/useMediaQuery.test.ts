import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useMediaQuery } from '@/hooks/useMediaQuery'

type Listener = () => void

function mockMatchMedia(initialMatches: boolean) {
  const listeners = new Set<Listener>()
  const mql = {
    matches: initialMatches,
    media: '',
    addEventListener: (_event: string, cb: Listener) => listeners.add(cb),
    removeEventListener: (_event: string, cb: Listener) => listeners.delete(cb),
    setMatches(next: boolean) {
      this.matches = next
      listeners.forEach((cb) => cb())
    },
  }
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue(mql),
  )
  return mql
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useMediaQuery', () => {
  it('returns the initial match state', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(true)
  })

  it('updates when the media query changes', () => {
    const mql = mockMatchMedia(false)
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(false)

    act(() => mql.setMatches(true))
    expect(result.current).toBe(true)
  })
})
