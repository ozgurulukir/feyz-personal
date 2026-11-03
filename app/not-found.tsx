import Link from 'next/link'
import Container from '@/components/container'

export const revalidate = 21600 // 60 * 60 * 6 = 6 hours

export default function NotFound() {
  return (
    <Container className="px-0 py-24 text-center">
      <h1 className="font-display mb-4 text-4xl font-black text-zinc-900 sm:text-5xl md:text-6xl">
        Sayfa bulunamadı
      </h1>
      <p className="mx-auto mb-8 max-w-md text-pretty text-zinc-600">
        Aradığınız sayfa mevcut değil veya bağlantı bozuk olabilir.
      </p>
      <Link
        href="/"
        className="font-display inline-flex items-center rounded-sm text-sm text-zinc-600 underline-offset-4 transition-colors hover:text-zinc-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        ← Anasayfaya dön
      </Link>
    </Container>
  )
}
