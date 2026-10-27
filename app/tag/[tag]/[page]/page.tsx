import { getRecords } from '@/utils/airtable'
import Page from '@/components/page'
import { DATA_PER_PAGE } from '@/utils/const'
import { AirtableRecord } from '@/types/airtable'
import { pageFill } from '@/utils/helper'

export async function generateStaticParams({
  params
}: {
  params: { tag: string; page: string }
}) {
  const data: AirtableRecord[] = await getRecords({})
  const dataFilterByTag = data.filter((item) =>
    item.fields?.tags.includes(params.tag)
  )
  const pages = pageFill(dataFilterByTag.length, DATA_PER_PAGE)
  return pages.map((page) => ({ page: page.toString(), tag: params.tag }))
}

export default async function Tag({
  params
}: {
  params: Promise<{ tag: string; page: string }>
}) {
  const { tag, page } = await params
  const data: AirtableRecord[] = await getRecords({})
  const dataFilterByTag = data.filter((item) => item.fields?.tags.includes(tag))

  const filterData = dataFilterByTag.slice(
    (Number(page) - 1) * DATA_PER_PAGE,
    Number(page) * DATA_PER_PAGE
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
