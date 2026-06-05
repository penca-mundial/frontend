import { describe, expect, it } from 'vitest'
import { avatarColor, formatThousands, groupInitials } from '@/features/groups/utils'

describe('formatThousands', () => {
  it('inserts rioplatense thousands separators', () => {
    expect(formatThousands(14)).toBe('14')
    expect(formatThousands(1247)).toBe('1.247')
    expect(formatThousands(1247000)).toBe('1.247.000')
  })
})

describe('groupInitials', () => {
  it('takes the first letters of the first two words', () => {
    expect(groupInitials('Los Cracks del Asado')).toBe('LC')
    expect(groupInitials('Oficina FC')).toBe('OF')
  })

  it('falls back to the first two letters of a single word', () => {
    expect(groupInitials('Cracks')).toBe('CR')
  })
})

describe('avatarColor', () => {
  it('is deterministic for a given name', () => {
    expect(avatarColor('Los Cracks')).toBe(avatarColor('Los Cracks'))
  })

  it('returns a class string from the palette', () => {
    expect(avatarColor('Oficina FC')).toMatch(/^bg-\[#[0-9a-f]{6}\] text-\[#[0-9a-f]{6}\]$/)
  })
})
