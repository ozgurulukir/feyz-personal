import type { Metadata } from 'next'
import { getRecords } from '@/utils/airtable'
import Page from '@/components/page'
import { DATA_PER_PAGE } from '@/utils/const'
import { AirtableRecord } from '@/types/airtable'

export async function generateStaticParams() {
  const data: AirtableRecord[] = await getRecords({})
  const flattenTags = data.flatMap((item) =>
    Array.isArray(item.fields?.tags) ? item.fields.tags : []
  )
  const uniqTags = [...new Set(flattenTags)].filter(Boolean)
  return uniqTags.map((tag) => ({ tag }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  return {
    title: `${decodedTag} - Feyz`,
    description: `${decodedTag} etiketine ait içerikler`
  }
}

export default async function Tag({
  params
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  const data: AirtableRecord[] = await getRecords({})
  const dataFilterByTag = data.filter(
    (item) =>
      Array.isArray(item.fields?.tags) && item.fields.tags.includes(decodedTag)
  )
  const filterData = dataFilterByTag.slice(0, DATA_PER_PAGE)

  return (
    <Page
      rawData={data}
      data={filterData}
      totalData={dataFilterByTag.length}
      tag={decodedTag}
    />
  )
}
