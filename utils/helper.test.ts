import { describe, expect, it } from 'vitest'
import { pageFill, safeDecode, toDate } from './helper'

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

describe('safeDecode', () => {
  it('decodes valid percent-encoded values', () => {
    expect(safeDecode('T%C3%BCrk%C3%A7e')).toBe('Türkçe')
    expect(safeDecode('/tag/C%23')).toBe('/tag/C#')
  })

  it('returns the input unchanged when it is not valid encoding', () => {
    expect(safeDecode('100%')).toBe('100%')
    expect(safeDecode('/tag/100%25')).toBe('/tag/100%')
  })
})

describe('toDate', () => {
  it('parses a valid ISO date', () => {
    expect(toDate('2026-01-15T10:00:00.000Z')?.toISOString()).toBe(
      '2026-01-15T10:00:00.000Z'
    )
  })

  it('returns undefined for missing or invalid values', () => {
    expect(toDate()).toBeUndefined()
    expect(toDate('')).toBeUndefined()
    expect(toDate('not-a-date')).toBeUndefined()
  })
})
