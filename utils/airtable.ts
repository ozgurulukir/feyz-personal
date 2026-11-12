import { AirtableRecord } from '@/types/airtable'

export const MAX_PAGINATION_DEPTH = 50
export const FETCH_TIMEOUT_MS = 30000
export const REVALIDATE_SECONDS = 21600

export async function getRecords({
  pageSize = 100,
  offset
}: {
  pageSize?: number
  offset?: string
} = {}): Promise<AirtableRecord[]> {
  const baseId = process.env.AIRTABLE_BASE_ID || 'appeqvrnUnbvHVDmH'
  const tableName = process.env.AIRTABLE_TABLE_NAME || 'content'
  const apiKey = process.env.AIRTABLE_API_KEY

  if (!apiKey) {
    console.warn(
      'Warning: AIRTABLE_API_KEY is not defined in environment variables.'
    )
    return []
  }

  const url = new URL(`/v0/${baseId}/${tableName}`, 'https://api.airtable.com')
  offset && url.searchParams.append('offset', offset)
  url.searchParams.append('pageSize', pageSize.toString())
  url.searchParams.append('view', 'Grid view')
  url.searchParams.append('sort[0][field]', 'createdDate')
  url.searchParams.append('sort[0][direction]', 'desc')
  url.searchParams.append('filterByFormula', 'draft=FALSE()')

  async function getData(depth = 0): Promise<AirtableRecord[]> {
    if (depth > MAX_PAGINATION_DEPTH) {
      throw new Error(
        `Max pagination depth (${MAX_PAGINATION_DEPTH}) exceeded, stopping Airtable fetch`
      )
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    let res: Response
    try {
      res = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`
        },
        next: { revalidate: REVALIDATE_SECONDS },
        signal: controller.signal
      })
    } finally {
      clearTimeout(timeoutId)
    }

    if (!res.ok) {
      throw new Error(
        `Failed to fetch from Airtable: HTTP ${res.status} ${res.statusText}`
      )
    }

    const data = await res.json()
    const records = Array.isArray(data.records) ? data.records : []

    if (data.offset) {
      url.searchParams.set('offset', data.offset)
      const nextRecords = await getData(depth + 1)
      return [...records, ...nextRecords]
    }

    return records
  }

  try {
    return await getData()
  } catch (error) {
    console.error('Error fetching records from Airtable:', error)
    return []
  }
}
