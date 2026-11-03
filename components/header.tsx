import { HTMLAttributes, ReactNode } from 'react'
import cx from '@/utils/cx'
import Container from '@/components/container'
import Link from 'next/link'
import { SITE_TITLE } from '@/utils/site'

export interface IAppHeader extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export default function AppHeader({ className, ...props }: IAppHeader) {
  return (
    <header className={cx('pt-8', className)} {...props}>
      <Container>
        <h1 className="font-display text-6xl leading-none font-black tracking-tight sm:text-7xl md:text-8xl">
          <Link
            href="/"
            className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {SITE_TITLE}
          </Link>
        </h1>
      </Container>
    </header>
  )
}
