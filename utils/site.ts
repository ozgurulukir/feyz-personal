const getSiteUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  return 'https://feyz.vercel.app'
}

export const SITE_TITLE = process.env.NEXT_PUBLIC_SITE_TITLE || 'Feyz'

export const SITE_DESCRIPTION =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Kafa açıcı içerikler'

export const SITE_URL = getSiteUrl()

export const SITE_TWITTER_HANDLE =
  process.env.NEXT_PUBLIC_SITE_TWITTER_HANDLE || '@ademilter'

export const SITE_LANGUAGE = process.env.NEXT_PUBLIC_SITE_LANGUAGE || 'tr'
