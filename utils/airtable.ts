import { AirtableRecord } from '@/types/airtable'

export const MAX_PAGINATION_DEPTH = 50
export const FETCH_TIMEOUT_MS = 30000

let cachedRecords: AirtableRecord[] | null = null
let cachePromise: Promise<AirtableRecord[]> | null = null

export async function getRecords({
  pageSize = 100,
  offset
}: {
  pageSize?: number
  offset?: string
} = {}): Promise<AirtableRecord[]> {
  const isDefaultCall = pageSize === 100 && offset === undefined

  // Module-level singleton cache for the default getRecords({}) call.
  // Ensures a single Airtable fetch per module lifetime across all SSR callers.
  if (isDefaultCall) {
    if (cachedRecords !== null) {
      return cachedRecords
    }
    if (cachePromise !== null) {
      return cachePromise
    }
  }

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
      console.error(
        `Max pagination depth (${MAX_PAGINATION_DEPTH}) exceeded, stopping Airtable fetch`
      )
      return []
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    try {
      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`
        },
        cache: 'force-cache',
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        console.error(
          `Failed to fetch from Airtable: HTTP ${res.status} ${res.statusText}`
        )
        return []
      }

      const data = await res.json()
      const records = Array.isArray(data.records) ? data.records : []

      if (data.offset) {
        url.searchParams.set('offset', data.offset)
        const nextRecords = await getData(depth + 1)
        return [...records, ...nextRecords]
      }

      return records
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('Error fetching records from Airtable:', error)
      return []
    }
  }

  const fetchPromise = getData()

  if (isDefaultCall) {
    cachePromise = fetchPromise
    cachePromise.then((records) => {
      cachedRecords = records
      cachePromise = null
    })
  }

  return fetchPromise
}
