import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import slugify from 'slugify'
import { getRecords } from '@/utils/airtable'
import { AirtableRecord } from '@/types/airtable'
import Feyz from '@/components/feyz'
import Nav from '@/components/nav'
import { findFeyzBySlug } from '@/utils/find-feyz-by-slug'

export const revalidate = 21600 // 60 * 60 * 6 = 6 hours

export async function generateStaticParams() {
  const data: AirtableRecord[] = await getRecords({})
  return data
    .filter((item) => Boolean(item.fields?.title))
    .map((item) => ({
      slug: slugify(item.fields.title || '', { lower: true, strict: true })
    }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data: AirtableRecord[] = await getRecords({})
  const feyz = findFeyzBySlug(data, slug)

  if (!feyz) return {}

  const title = feyz.fields.title || ''
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
  const feyz = findFeyzBySlug(data, slug)

  if (!feyz) {
    notFound()
  }

  const flattenTags = data.flatMap((item) => item.fields.tags || [])
  const tags = [...new Set(flattenTags)]

  return (
    <>
      <Nav tags={tags} />

      <div className="mt-8 border-y border-zinc-200">
        <Feyz feyz={feyz} />
      </div>

      <div className="mt-8">
        <Link
          href="/"
          className="font-display inline-flex items-center rounded-sm text-sm text-zinc-600 underline-offset-4 transition-colors hover:text-zinc-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          ← Tüm içerikler
        </Link>
      </div>
    </>
  )
}
