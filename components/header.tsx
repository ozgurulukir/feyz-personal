import { HTMLAttributes, ReactNode } from 'react'
import cx from '@/utils/cx'
import Container from '@/components/container'
import Link from 'next/link'

export interface IAppHeader extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export default function AppHeader({ className, ...props }: IAppHeader) {
  return (
    <header className={cx('pt-8', className)} {...props}>
      <Container>
        <h1 className="font-display text-8xl leading-none font-black hover:underline">
          <Link href="/">Feyz</Link>
        </h1>
      </Container>
    </header>
  )
}
