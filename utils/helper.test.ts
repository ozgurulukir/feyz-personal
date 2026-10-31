import { describe, expect, it } from 'vitest'
import { pageFill } from './helper'

describe('pageFill', () => {
  it('returns empty array for count 0', () => {
    expect(pageFill(0, 10)).toEqual([])
  })

  it('returns empty array when page 1 is the only page (omitted)', () => {
    expect(pageFill(10, 10)).toEqual([])
  })

  it('returns [2] when count exceeds one page', () => {
    expect(pageFill(11, 10)).toEqual([2])
  })

  it('returns [2, 3] for count 25 with perPage 10', () => {
    expect(pageFill(25, 10)).toEqual([2, 3])
  })

  it('returns pages 2 through 10 for count 100 with perPage 10', () => {
    expect(pageFill(100, 10)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10])
  })
})
