import { describe, expect, it } from 'vitest'
import { formatThousands } from '@/lib/format'

describe('formatThousands', () => {
  it('inserts rioplatense thousands separators', () => {
    expect(formatThousands(14)).toBe('14')
    expect(formatThousands(1247)).toBe('1.247')
    expect(formatThousands(1247000)).toBe('1.247.000')
  })
})
