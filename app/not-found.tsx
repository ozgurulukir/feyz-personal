import Link from 'next/link'
import Container from '@/components/container'

export const revalidate = 21600 // 60 * 60 * 6 = 6 hours

export default function NotFound() {
  return (
    <Container className="px-0 py-24 text-center">
      <h1 className="font-display mb-4 text-6xl font-black text-zinc-900">
        Sayfa bulunamadı
      </h1>
      <p className="mx-auto mb-8 max-w-md text-zinc-600">
        Aradığınız sayfa mevcut değil veya bağlantı bozuk olabilir.
      </p>
      <Link
        href="/"
        className="font-display text-sm opacity-60 hover:underline hover:opacity-100"
      >
        ← Anasayfaya dön
      </Link>
    </Container>
  )
}
