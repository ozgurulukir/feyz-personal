import { describe, expect, it } from 'vitest'
import { findFeyzBySlug } from './find-feyz-by-slug'
import type { AirtableRecord } from '@/types/airtable'

function makeRecord(title: string | undefined): AirtableRecord {
  return {
    id: 'rec1',
    createdTime: '2024-01-01T00:00:00.000Z',
    fields: title !== undefined ? { title } : {},
  }
}

describe('findFeyzBySlug', () => {
  const data: AirtableRecord[] = [
    makeRecord('Hello World'),
    makeRecord('Feyz.li - Kişisel Web Sitesi'),
    makeRecord('Another Post'),
    makeRecord(undefined),
  ]

  it('finds exact slug match', () => {
    const result = findFeyzBySlug(data, 'hello-world')
    expect(result?.id).toBe('rec1')
    expect(result?.fields.title).toBe('Hello World')
  })

  it('returns undefined for non-existent slug', () => {
    const result = findFeyzBySlug(data, 'non-existent-slug')
    expect(result).toBeUndefined()
  })

  it('slugifies with lower: true, strict: true ("Hello World" → "hello-world")', () => {
    const result = findFeyzBySlug(data, 'hello-world')
    expect(result?.fields.title).toBe('Hello World')
  })

  it('skips items without title', () => {
    const result = findFeyzBySlug(data, '')
    expect(result).toBeUndefined()
  })

  it('handles empty data array', () => {
    const result = findFeyzBySlug([], 'hello-world')
    expect(result).toBeUndefined()
  })
})
