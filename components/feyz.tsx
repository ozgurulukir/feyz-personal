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
    <article className="flex flex-col-reverse gap-6 py-8 sm:flex-row sm:gap-8 sm:py-10">
      <div className="min-w-0 grow">
        {isQuote ? (
          <h2 className="font-display text-3xl leading-[1.2] break-words sm:text-4xl md:text-5xl">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={url}
              className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Balancer>{title}</Balancer>
              <span className="sr-only"> (yeni sekmede açılır)</span>
            </a>
          </h2>
        ) : (
          <>
            <h2 className="font-display text-2xl leading-snug font-bold break-words sm:text-3xl">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={url}
                className="rounded-sm underline-offset-4 visited:text-zinc-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <Balancer>{title}</Balancer>
                <span className="sr-only"> (yeni sekmede açılır)</span>
              </a>
            </h2>
            {summary && (
              <p className="mt-2 leading-relaxed text-pretty break-words text-zinc-700">
                {summary}
              </p>
            )}
          </>
        )}

        <footer className="mt-4 flex flex-wrap items-center gap-1.5 text-sm text-zinc-600">
          <Link
            href={`/feyz/${slug}`}
            className="rounded-sm tabular-nums underline-offset-2 hover:text-zinc-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {relativeDate || 'Bağlantı'}
          </Link>

          {sourceHostname && normalizedSourceUrl && (
            <>
              <span className="text-zinc-400 select-none" aria-hidden="true">
                /
              </span>
              <a
                href={normalizedSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm underline-offset-2 hover:text-zinc-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {sourceHostname}
                <span className="sr-only"> (yeni sekmede açılır)</span>
              </a>
            </>
          )}
        </footer>
      </div>

      {cover && (
        <div className="w-full shrink-0 pt-1 sm:w-1/3">
          <Image
            src={cover.url}
            alt={title || ''}
            width={cover?.width || 400}
            height={cover?.height || 400}
            className="w-full rounded-lg object-cover outline outline-1 -outline-offset-1 outline-black/10"
          />
        </div>
      )}
    </article>
  )
}
