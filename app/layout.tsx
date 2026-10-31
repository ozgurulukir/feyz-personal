import './globals.css'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import { ReactNode } from 'react'
import cx from '@/utils/cx'
import { SITE_TITLE, SITE_DESCRIPTION, SITE_URL, SITE_TWITTER_HANDLE } from '@/utils/site'
import AnalyticsWrapper from './analytics'
import Header from '@/components/header'
import Footer from '@/components/footer'
import Container from '@/components/container'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="tr"
      className={cx(
        inter.variable,
        interDisplay.variable,
        'scroll-smooth text-zinc-900 antialiased'
      )}
    >
      <body>
        <Header />
        <main>
          <Container>{children}</Container>
        </main>
        <Footer />

        <AnalyticsWrapper />
      </body>
    </html>
  )
}

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin-ext']
})

const interDisplay = localFont({
  variable: '--font-display',
  src: [
    {
      path: './fonts/inter/Inter-DisplayMedium.woff2',
      weight: '400'
    },
    {
      path: './fonts/inter/Inter-DisplayBold.woff2',
      weight: '700'
    },
    {
      path: './fonts/inter/Inter-DisplayBlack.woff2',
      weight: '900'
    }
  ]
})

export const metadata: Metadata = {
  title: {
    default: `${SITE_TITLE} - ${SITE_DESCRIPTION}`,
    template: `%s | Feyz`
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_TITLE,
    type: 'website'
  },
  twitter: {
    card: 'summary',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: SITE_TWITTER_HANDLE
  },
  robots: {
    index: true,
    follow: true
  },
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🤯</text></svg>'
  }
}
