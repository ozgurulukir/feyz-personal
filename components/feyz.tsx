import Balancer from 'react-wrap-balancer'
import Image from 'next/image'
import Link from 'next/link'
import { DateTime } from 'luxon'
import { AirtableRecord } from '@/types/airtable'
import slugify from 'slugify'

export default function Feyz({ feyz }: { feyz: AirtableRecord }) {
  const { tags, createdDate, image, summary, title, url, source } = feyz.fields

  const cover = image && image[0]

  const isQuote = Array.isArray(tags) ? tags.includes('quote') : false

  let sourceHostname: string | undefined
  let normalizedSourceUrl: string | undefined
  if (source) {
    try {
      normalizedSourceUrl =
        source.startsWith('http://') || source.startsWith('https://')
          ? source
          : `https://${source}`
      sourceHostname = new URL(normalizedSourceUrl).hostname
    } catch {
      sourceHostname = undefined
      normalizedSourceUrl = undefined
    }
  }

  const slug = slugify(title || '', { lower: true, strict: true })
  let relativeDate: string | null = null
  if (createdDate) {
    try {
      const dt = DateTime.fromISO(createdDate)
      if (dt.isValid) {
        relativeDate = dt.toRelative()
      }
    } catch {
      relativeDate = null
    }
  }

  return (
    <article className="flex gap-8 py-10">
      <div className="grow">
        {isQuote ? (
          <h2 className="font-display text-5xl leading-[1.2]">
            <a target="_blank" rel="noopener noreferrer" href={url}>
              <Balancer>{title}</Balancer>
            </a>
          </h2>
        ) : (
          <>
            <h2 className="font-display text-3xl leading-snug font-bold">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={url}
                className="visited:text-zinc-600"
              >
                <Balancer>{title}</Balancer>
              </a>
            </h2>
            {summary && <p className="mt-2 opacity-80">{summary}</p>}
          </>
        )}

        <footer className="mt-4 flex items-center gap-1 opacity-40">
          <Link href={`/feyz/${slug}`}>{relativeDate || 'Bağlantı'}</Link>

          {sourceHostname && normalizedSourceUrl && (
            <>
              <span className="opacity-60">/</span>
              <a
                href={normalizedSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {sourceHostname}
              </a>
            </>
          )}
        </footer>
      </div>

      {cover && (
        <div className="w-1/3 shrink-0 pt-1">
          <Image
            src={cover.url}
            alt={title || ''}
            width={cover?.width || 400}
            height={cover?.height || 400}
            className="rounded-lg"
          />
        </div>
      )}
    </article>
  )
}
