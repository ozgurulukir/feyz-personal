import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('site constants', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('provides default fallback values when env vars are unset', async () => {
    delete process.env.NEXT_PUBLIC_SITE_TITLE
    delete process.env.NEXT_PUBLIC_SITE_DESCRIPTION
    delete process.env.NEXT_PUBLIC_SITE_URL
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL
    delete process.env.NEXT_PUBLIC_SITE_TWITTER_HANDLE
    delete process.env.NEXT_PUBLIC_SITE_LANGUAGE

    const site = await import('./site')

    expect(site.SITE_TITLE).toBe('Feyz')
    expect(site.SITE_DESCRIPTION).toBe('Kafa açıcı içerikler')
    expect(site.SITE_URL).toBe('https://feyz.vercel.app')
    expect(site.SITE_TWITTER_HANDLE).toBe('@ademilter')
    expect(site.SITE_LANGUAGE).toBe('tr')
  })

  it('uses NEXT_PUBLIC environment variables when provided', async () => {
    process.env.NEXT_PUBLIC_SITE_TITLE = 'Kişisel Feyz'
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION = 'Özgür paylaşımlar'
    process.env.NEXT_PUBLIC_SITE_URL = 'https://custom-feyz.com/'
    process.env.NEXT_PUBLIC_SITE_TWITTER_HANDLE = '@ozguru'
    process.env.NEXT_PUBLIC_SITE_LANGUAGE = 'en'

    const site = await import('./site')

    expect(site.SITE_TITLE).toBe('Kişisel Feyz')
    expect(site.SITE_DESCRIPTION).toBe('Özgür paylaşımlar')
    expect(site.SITE_URL).toBe('https://custom-feyz.com') // trimmed trailing slash
    expect(site.SITE_TWITTER_HANDLE).toBe('@ozguru')
    expect(site.SITE_LANGUAGE).toBe('en')
  })

  it('falls back to VERCEL_PROJECT_PRODUCTION_URL if NEXT_PUBLIC_SITE_URL is not set', async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'my-feyz.vercel.app'

    const site = await import('./site')

    expect(site.SITE_URL).toBe('https://my-feyz.vercel.app')
  })
})
