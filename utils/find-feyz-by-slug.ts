import slugify from 'slugify'
import { AirtableRecord } from '@/types/airtable'

export function findFeyzBySlug(
  data: AirtableRecord[],
  slug: string
): AirtableRecord | undefined {
  return data.find(
    (item) =>
      item.fields?.title &&
      slugify(item.fields.title, { lower: true, strict: true }) === slug
  )
}
