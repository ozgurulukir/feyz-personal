import { MetadataRoute } from 'next'
import slugify from 'slugify'
import { getRecords } from '@/utils/airtable'
import { DATA_PER_PAGE } from '@/utils/const'
import { pageFill } from '@/utils/helper'
import { AirtableRecord } from '@/types/airtable'

const SITE_URL = 'https://feyz.vercel.app'

export const revalidate = 21600 // 60 * 60 * 6 = 6 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data: AirtableRecord[] = await getRecords({})

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified:
        data.length > 0 && data[0]?.fields?.createdDate
          ? new Date(data[0].fields.createdDate)
          : undefined,
    },
  ]

  // Gracefully return just the home page when there are no records (e.g. no API key)
  if (data.length === 0) {
    return entries
  }

  // /feyz/[slug] routes — slug matches app/feyz/[slug]/page.tsx pattern
  const feyzRoutes = data
    .filter((item) => Boolean(item.fields?.title))
    .map((item) => {
      const slug = slugify(item.fields.title || '', {
        lower: true,
        strict: true,
      })
      return {
        url: `${SITE_URL}/feyz/${slug}`,
        lastModified: item.fields?.createdDate
          ? new Date(item.fields.createdDate)
          : undefined,
      }
    })
  entries.push(...feyzRoutes)

  // Unique tags (raw tag values, matching app/tag/[tag]/page.tsx)
  const flattenTags = data.flatMap((item) =>
    Array.isArray(item.fields?.tags) ? item.fields.tags : []
  )
  const uniqTags = [...new Set(flattenTags)].filter(Boolean)

  // /tag/[tag] routes
  const tagRoutes = uniqTags.map((tag) => ({
    url: `${SITE_URL}/tag/${encodeURIComponent(tag)}`,
    lastModified: undefined,
  }))
  entries.push(...tagRoutes)

  // Paginated tag pages /tag/[tag]/[page] for tags with more than DATA_PER_PAGE items
  for (const tag of uniqTags) {
    const dataFilterByTag = data.filter(
      (item) =>
        Array.isArray(item.fields?.tags) && item.fields.tags.includes(tag)
    )
    const pages = pageFill(dataFilterByTag.length, DATA_PER_PAGE)
    const tagPageRoutes = pages.map((page) => ({
      url: `${SITE_URL}/tag/${encodeURIComponent(tag)}/${page}`,
      lastModified: undefined,
    }))
    entries.push(...tagPageRoutes)
  }

  // Paginated home pages /[page] for page 2+
  const homePageRoutes = pageFill(data.length, DATA_PER_PAGE).map((page) => ({
    url: `${SITE_URL}/${page}`,
    lastModified: undefined,
  }))
  entries.push(...homePageRoutes)

  return entries
}
