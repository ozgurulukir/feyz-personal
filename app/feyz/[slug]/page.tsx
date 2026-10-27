import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import slugify from 'slugify'
import { getRecords } from '@/utils/airtable'
import { AirtableRecord } from '@/types/airtable'
import Feyz from '@/components/feyz'
import Nav from '@/components/nav'

export const revalidate = 21600 // 60 * 60 * 6 = 6 hours

export async function generateStaticParams() {
  const data: AirtableRecord[] = await getRecords({})
  return data
    .filter((item) => Boolean(item.fields?.title))
    .map((item) => ({
      slug: slugify(item.fields.title, { lower: true, strict: true })
    }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data: AirtableRecord[] = await getRecords({})
  const feyz = data.find(
    (item) =>
      item.fields?.title &&
      slugify(item.fields.title, { lower: true, strict: true }) === slug
  )

  if (!feyz) return {}

  const title = feyz.fields.title
  const description = feyz.fields.summary || title

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(feyz.fields.image?.[0]?.url && {
        images: [{ url: feyz.fields.image[0].url }]
      })
    }
  }
}

export default async function FeyzDetail({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data: AirtableRecord[] = await getRecords({})
  const feyz = data.find(
    (item) =>
      item.fields?.title &&
      slugify(item.fields.title, { lower: true, strict: true }) === slug
  )

  if (!feyz) {
    notFound()
  }

  const flattenTags = data.flatMap((item) => item.fields.tags || [])
  const tags = [...new Set(flattenTags)]

  return (
    <>
      <Nav tags={tags} />

      <div className="mt-8 border-y">
        <Feyz feyz={feyz} />
      </div>

      <div className="mt-8">
        <Link
          href="/"
          className="font-display text-sm opacity-60 hover:underline hover:opacity-100"
        >
          ← Tüm içerikler
        </Link>
      </div>
    </>
  )
}
