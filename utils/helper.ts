/**
 * Builds pagination page numbers starting from page 2.
 * Page 1 is intentionally omitted because it corresponds to the base route
 * (`/` or `/tag/{tag}`), which renders the first page of results.
 */
export function pageFill(count: number, perPage: number): number[] {
  const arr = Array(Math.ceil(count / perPage))
    .fill('')
    .map((_, i) => i + 1)
  if (arr.indexOf(1) === 0) arr.shift()
  return arr
}

/**
 * Decodes a URI component without throwing on malformed input (e.g. a tag
 * containing a literal `%`). Next.js already decodes dynamic route params, so
 * this is only used to compare encoded pathnames against decoded values.
 */
export function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/** Parses an ISO date string, returning undefined for missing/invalid values. */
export function toDate(value?: string): Date | undefined {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}
