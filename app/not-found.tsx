import Link from 'next/link'
import Container from '@/components/container'

export const revalidate = 21600 // 60 * 60 * 6 = 6 hours

export default function NotFound() {
  return (
    <Container className="py-24 text-center px-0">
      <h1 className="font-display text-6xl font-black text-zinc-900 mb-4">
        Sayfa bulunamadı
      </h1>
      <p className="text-zinc-600 mb-8 max-w-md mx-auto">
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
