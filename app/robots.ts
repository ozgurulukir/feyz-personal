import { MetadataRoute } from 'next'

const SITE_URL = 'https://feyz.vercel.app'

export const revalidate = 21600 // 60 * 60 * 6 = 6 hours

export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
