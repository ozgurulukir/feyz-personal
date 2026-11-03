import { HTMLAttributes, ReactNode } from 'react'
import cx from '@/utils/cx'
import Container from '@/components/container'
import { SITE_TITLE, SITE_DESCRIPTION } from '@/utils/site'

export interface IAppFooter extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export default function AppFooter({ className, ...props }: IAppFooter) {
  return (
    <footer
      className={cx('py-20 text-center text-sm text-zinc-500', className)}
      {...props}
    >
      <Container>
        <p className="text-balance">
          {SITE_TITLE} &mdash; {SITE_DESCRIPTION}
        </p>
      </Container>
    </footer>
  )
}
