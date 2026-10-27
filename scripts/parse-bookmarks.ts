export interface ParsedBookmark {
  url: string
  normalizedUrl: string
  title: string
  source: string
  createdDate: string
  tags: string[]
  summary: string
  folder: string
  folderPath: string[]
}

export function unescapeHtml(text: string): string {
  return text
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl.trim())
    // Ignore internal protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return ''
    }

    // Strip common marketing tracking parameters
    const trackingParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'fbclid',
      'gclid',
      'ref'
    ]
    trackingParams.forEach((param) => parsed.searchParams.delete(param))

    // Remove hash fragment for deduplication
    parsed.hash = ''

    // Trim trailing slash for non-root paths or empty paths
    let clean = parsed.toString()
    if (clean.endsWith('/') && parsed.pathname === '/') {
      clean = clean.slice(0, -1)
    }
    return clean
  } catch {
    return ''
  }
}

export function extractSourceUrl(url: string): string {
  try {
    return new URL(url).origin
  } catch {
    return ''
  }
}

export function parseBookmarksHtml(html: string): ParsedBookmark[] {
  const items: ParsedBookmark[] = []
  const lines = html.split(/\r?\n/)
  const folderStack: string[] = []
  let pendingFolder: string | null = null
  let lastItem: ParsedBookmark | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Detect folder heading: <H3 ...>FolderName</H3>
    const h3Match = trimmed.match(/<H3[^>]*>(.*?)<\/H3>/i)
    if (h3Match) {
      pendingFolder = unescapeHtml(h3Match[1])
    }

    // DL tag opens folder level
    if (/<DL>/i.test(trimmed)) {
      folderStack.push(pendingFolder || '')
      pendingFolder = null
    }

    // Closing DL tag pops folder level
    if (/<\/DL>/i.test(trimmed)) {
      folderStack.pop()
    }

    // Detect link: <DT><A HREF="..." ADD_DATE="..." TAGS="...">Title</A>
    const aMatch = trimmed.match(/<A\s+([^>]+)>(.*?)<\/A>/i)
    if (aMatch) {
      const attrsStr = aMatch[1]
      const title = unescapeHtml(aMatch[2])
      const hrefMatch = attrsStr.match(/HREF="([^"]+)"/i)
      const dateMatch = attrsStr.match(/ADD_DATE="([^"]+)"/i)
      const tagsMatch = attrsStr.match(/TAGS="([^"]+)"/i)

      if (hrefMatch) {
        const rawUrl = hrefMatch[1].trim()
        const normalized = normalizeUrl(rawUrl)

        // Ignore invalid / non-web URLs (javascript:, chrome://, file://, etc.)
        if (normalized) {
          const addDate = dateMatch ? parseInt(dateMatch[1], 10) : null
          const rawTags = tagsMatch
            ? tagsMatch[1]
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
            : []

          const currentFolder =
            folderStack.filter(Boolean)[
              folderStack.filter(Boolean).length - 1
            ] || ''

          let createdDate = new Date().toISOString()
          if (addDate && !isNaN(addDate) && addDate > 0) {
            let dateMs = addDate
            if (dateMs > 1e14) {
              dateMs = Math.floor(dateMs / 1000)
            } else if (dateMs < 1e11) {
              dateMs = dateMs * 1000
            }
            createdDate = new Date(dateMs).toISOString()
          }

          const item: ParsedBookmark = {
            url: rawUrl,
            normalizedUrl: normalized,
            title: title || rawUrl,
            source: extractSourceUrl(rawUrl),
            createdDate,
            tags: rawTags,
            summary: '',
            folder: currentFolder,
            folderPath: folderStack.filter(Boolean)
          }

          items.push(item)
          lastItem = item
        }
      }
    }

    // Detect note / description: <DD>Some note
    const ddMatch = trimmed.match(/<DD>(.*)/i)
    if (ddMatch && lastItem) {
      lastItem.summary = unescapeHtml(ddMatch[1])
    }
  }

  return items
}
