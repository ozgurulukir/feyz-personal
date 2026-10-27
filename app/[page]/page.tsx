import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getRecords } from '@/utils/airtable'
import Page from '@/components/page'
import { DATA_PER_PAGE } from '@/utils/const'
import { pageFill } from '@/utils/helper'
import { AirtableRecord } from '@/types/airtable'

export const revalidate = 21600 // 60 * 60 * 6 = 6 hours

export async function generateStaticParams() {
  const data: AirtableRecord[] = await getRecords({})
  const pages = pageFill(data.length, DATA_PER_PAGE)
  return pages.map((page) => ({ page: page.toString() }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ page: string }>
}): Promise<Metadata> {
  const { page } = await params
  return {
    title: `Sayfa ${page} - Feyz`,
    description: `Feyz.li içerikleri - Sayfa ${page}`
  }
}

export default async function Home({
  params
}: {
  params: Promise<{ page: string }>
}) {
  const { page } = await params
  const pageNumber = Number(page)

  if (isNaN(pageNumber) || pageNumber < 2) {
    notFound()
  }

  const data: AirtableRecord[] = await getRecords({})
  const startIndex = (pageNumber - 1) * DATA_PER_PAGE

  if (data.length > 0 && startIndex >= data.length) {
    notFound()
  }

  const filterData = data.slice(startIndex, pageNumber * DATA_PER_PAGE)

  return <Page rawData={data} totalData={data.length} data={filterData} />
}
