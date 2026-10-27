import { AirtableRecord } from '@/types/airtable'

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

  async function getData(): Promise<AirtableRecord[]> {
    try {
      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`
        },
        cache: 'force-cache'
      })

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
        const nextRecords = await getData()
        return [...records, ...nextRecords]
      }

      return records
    } catch (error) {
      console.error('Error fetching records from Airtable:', error)
      return []
    }
  }

  return getData()
}
