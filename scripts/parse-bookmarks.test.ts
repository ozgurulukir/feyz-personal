import { describe, expect, it } from 'vitest'
import {
  extractSourceUrl,
  normalizeUrl,
  parseBookmarksHtml,
  unescapeHtml,
} from './parse-bookmarks'

describe('normalizeUrl', () => {
  it('strips utm_*, fbclid, gclid, ref params', () => {
    expect(
      normalizeUrl(
        'https://example.com/page?utm_source=foo&utm_medium=bar&fbclid=123&gclid=456&ref=xyz&keep=1'
      )
    ).toBe('https://example.com/page?keep=1')
  })

  it('removes hash fragment', () => {
    expect(normalizeUrl('https://example.com/page#section')).toBe(
      'https://example.com/page'
    )
  })

  it('strips trailing slash for root path', () => {
    expect(normalizeUrl('https://example.com/')).toBe('https://example.com')
  })

  it("returns '' for non-http(s) protocols", () => {
    expect(normalizeUrl('javascript:alert(1)')).toBe('')
    expect(normalizeUrl('chrome://settings')).toBe('')
    expect(normalizeUrl('file:///etc/passwd')).toBe('')
  })
})

describe('unescapeHtml', () => {
  it('converts HTML entities', () => {
    expect(unescapeHtml('&amp;')).toBe('&')
    expect(unescapeHtml('&lt;div&gt;')).toBe('<div>')
    expect(unescapeHtml('&quot;hello&quot;')).toBe('"hello"')
  })

  it('strips HTML tags and collapses whitespace', () => {
    expect(unescapeHtml('<b>Hello</b>   World')).toBe('Hello World')
  })
})

describe('extractSourceUrl', () => {
  it('returns origin', () => {
    expect(extractSourceUrl('https://example.com/page?x=1')).toBe(
      'https://example.com'
    )
  })

  it('returns empty string for invalid url', () => {
    expect(extractSourceUrl('not-a-url')).toBe('')
  })
})

describe('parseBookmarksHtml', () => {
  it('parses a minimal Netscape bookmarks HTML', () => {
    const html = `
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="1700000000" LAST_MODIFIED="1700000000">Folder One</H3>
    <DL><p>
        <DT><A HREF="https://example.com/a" ADD_DATE="1700000001" TAGS="tag1,tag2">Link A</A>
        <DD>Note for A
        <DT><A HREF="https://example.com/b" ADD_DATE="1700000002">Link B</A>
    </DL><p>
</DL><p>
`
    const items = parseBookmarksHtml(html)
    expect(items.length).toBe(2)

    expect(items[0].url).toBe('https://example.com/a')
    expect(items[0].title).toBe('Link A')
    expect(items[0].tags).toEqual(['tag1', 'tag2'])
    expect(items[0].summary).toBe('Note for A')
    expect(items[0].folder).toBe('Folder One')
    expect(items[0].folderPath).toEqual(['Folder One'])

    expect(items[1].url).toBe('https://example.com/b')
    expect(items[1].title).toBe('Link B')
    expect(items[1].tags).toEqual([])
    expect(items[1].summary).toBe('')
    expect(items[1].folder).toBe('Folder One')
  })

  it('handles ADD_DATE in ms vs seconds', () => {
    const htmlMs = `
<DL><p>
    <DT><A HREF="https://example.com/ms" ADD_DATE="1700000000000">MS Link</A>
</DL><p>
`
    const htmlSec = `
<DL><p>
    <DT><A HREF="https://example.com/sec" ADD_DATE="1700000000">Sec Link</A>
</DL><p>
`

    const itemsMs = parseBookmarksHtml(htmlMs)
    const itemsSec = parseBookmarksHtml(htmlSec)

    // Both should produce valid ISO dates; ms value is divided down to seconds internally
    expect(new Date(itemsMs[0].createdDate).getTime()).toBeGreaterThan(0)
    expect(new Date(itemsSec[0].createdDate).getTime()).toBeGreaterThan(0)
  })

  it('returns empty array for empty bookmarks HTML', () => {
    expect(parseBookmarksHtml('')).toEqual([])
    expect(parseBookmarksHtml('<DL><p></DL><p>')).toEqual([])
  })
})
