import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getRecords } from '@/utils/airtable'
import Page from '@/components/page'
import { DATA_PER_PAGE } from '@/utils/const'
import { AirtableRecord } from '@/types/airtable'
import { pageFill } from '@/utils/helper'

export async function generateStaticParams() {
  const data: AirtableRecord[] = await getRecords({})
  const flattenTags = data.flatMap((item) =>
    Array.isArray(item.fields?.tags) ? item.fields.tags : []
  )
  const uniqTags = [...new Set(flattenTags)].filter(Boolean)

  return uniqTags.flatMap((tag) => {
    const dataFilterByTag = data.filter(
      (item) =>
        Array.isArray(item.fields?.tags) && item.fields.tags.includes(tag)
    )
    const pages = pageFill(dataFilterByTag.length, DATA_PER_PAGE)
    return pages.map((page) => ({ tag, page: page.toString() }))
  })
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ tag: string; page: string }>
}): Promise<Metadata> {
  const { tag, page } = await params
  return {
    title: `${tag} - Sayfa ${page}`,
    description: `${tag} etiketine ait içerikler - Sayfa ${page}`
  }
}

export default async function Tag({
  params
}: {
  params: Promise<{ tag: string; page: string }>
}) {
  const { tag, page } = await params
  const pageNumber = Number(page)

  if (!Number.isInteger(pageNumber) || pageNumber < 2) {
    notFound()
  }

  const data: AirtableRecord[] = await getRecords({})
  const dataFilterByTag = data.filter(
    (item) => Array.isArray(item.fields?.tags) && item.fields.tags.includes(tag)
  )

  const startIndex = (pageNumber - 1) * DATA_PER_PAGE
  if (dataFilterByTag.length > 0 && startIndex >= dataFilterByTag.length) {
    notFound()
  }

  const filterData = dataFilterByTag.slice(
    startIndex,
    pageNumber * DATA_PER_PAGE
  )

  return (
    <Page
      rawData={data}
      data={filterData}
      totalData={dataFilterByTag.length}
      tag={tag}
    />
  )
}
