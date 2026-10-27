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
