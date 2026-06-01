import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCountdown } from '@/features/tournament-predictions/hooks/useCountdown'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('useCountdown', () => {
  it('ticks down once per second to zero', () => {
    const { result } = renderHook(() => useCountdown(3))
    expect(result.current).toBe(3)

    act(() => vi.advanceTimersByTime(1000))
    expect(result.current).toBe(2)

    act(() => vi.advanceTimersByTime(2000))
    expect(result.current).toBe(0)
  })

  it('calls onElapsed exactly once when it reaches zero', () => {
    const onElapsed = vi.fn()
    renderHook(() => useCountdown(2, onElapsed))

    act(() => vi.advanceTimersByTime(2000))
    expect(onElapsed).toHaveBeenCalledTimes(1)

    act(() => vi.advanceTimersByTime(5000))
    expect(onElapsed).toHaveBeenCalledTimes(1)
  })
})
