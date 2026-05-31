import { describe, expect, it } from 'vitest'
import { LIVE_POLL_INTERVAL_MS, pollIntervalFor } from '@/features/matches/hooks/useMatch'

describe('pollIntervalFor', () => {
  it('polls every 12s only while live', () => {
    expect(pollIntervalFor('live')).toBe(LIVE_POLL_INTERVAL_MS)
    expect(pollIntervalFor('scheduled')).toBe(false)
    expect(pollIntervalFor('finished')).toBe(false)
    expect(pollIntervalFor(undefined)).toBe(false)
  })
})
