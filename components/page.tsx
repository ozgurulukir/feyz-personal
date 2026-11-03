import Feyz from '@/components/feyz'
import { AirtableRecord } from '@/types/airtable'
import Pagination from '@/components/pagination'
import Nav from '@/components/nav'

export default function Page({
  rawData = [],
  totalData = 0,
  data = [],
  tag
}: {
  rawData: AirtableRecord[]
  data: AirtableRecord[]
  totalData: number
  tag?: string
}) {
  const flattenTags = rawData.flatMap((item) =>
    Array.isArray(item.fields?.tags) ? item.fields.tags : []
  )
  const tags = [...new Set(flattenTags)].filter(Boolean)

  return (
    <>
      <Nav tags={tags} />

      <div className="mt-8 divide-y divide-zinc-200 border-y border-zinc-200">
        {data.map((feyz: AirtableRecord) => (
          <Feyz key={feyz.id} feyz={feyz} />
        ))}
      </div>

      <Pagination totalData={totalData} tag={tag} />
    </>
  )
}
