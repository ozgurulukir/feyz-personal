import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MAX_PAGINATION_DEPTH, getRecords } from './airtable'
import type { AirtableRecord } from '@/types/airtable'

function record(id: string): AirtableRecord {
  return {
    id,
    createdTime: '2024-01-01T00:00:00.000Z',
    fields: { title: id }
  }
}

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: async () => body
  } as Response
}

describe('getRecords', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv, AIRTABLE_API_KEY: 'test-key' }
    delete process.env.AIRTABLE_BASE_ID
    delete process.env.AIRTABLE_TABLE_NAME
  })

  afterEach(() => {
    process.env = originalEnv
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('returns an empty array and warns when the API key is missing', async () => {
    delete process.env.AIRTABLE_API_KEY
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(getRecords()).resolves.toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalled()
  })

  it('requests the configured view, sort, and draft filter', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ records: [] }))
    vi.stubGlobal('fetch', fetchMock)

    await getRecords()

    const url = new URL(String(fetchMock.mock.calls[0][0]))
    expect(url.searchParams.get('view')).toBe('Grid view')
    expect(url.searchParams.get('sort[0][field]')).toBe('createdDate')
    expect(url.searchParams.get('sort[0][direction]')).toBe('desc')
    expect(url.searchParams.get('filterByFormula')).toBe('draft=FALSE()')
    expect(url.searchParams.get('pageSize')).toBe('100')
  })

  it('follows pagination offsets and concatenates records', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ records: [record('a')], offset: 'next-page' })
      )
      .mockResolvedValueOnce(jsonResponse({ records: [record('b')] }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(getRecords()).resolves.toEqual([record('a'), record('b')])
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(String(fetchMock.mock.calls[1][0])).toContain('offset=next-page')
  })

  it('returns an empty array when Airtable responds with an error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({}, false, 500))
    )
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(getRecords()).resolves.toEqual([])
    expect(error).toHaveBeenCalled()
  })

  it('returns an empty array when the network request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('boom')))
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(getRecords()).resolves.toEqual([])
    expect(error).toHaveBeenCalled()
  })

  it('stops after the maximum pagination depth', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ records: [record('a')], offset: 'loop' })
      )
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(getRecords()).resolves.toEqual([])
    expect(fetchMock).toHaveBeenCalledTimes(MAX_PAGINATION_DEPTH + 1)
  })
})
