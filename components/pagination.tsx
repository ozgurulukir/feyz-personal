'use client'

import Link, { LinkProps } from 'next/link'
import { pageFill } from '@/utils/helper'
import { DATA_PER_PAGE } from '@/utils/const'
import cx from '@/utils/cx'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export default function Pagination({
  totalData,
  tag
}: {
  totalData: number
  tag?: string
}) {
  if (totalData <= DATA_PER_PAGE) {
    return null
  }

  const PAGES = pageFill(totalData, DATA_PER_PAGE)
  const pathname = usePathname()

  const isActiveFirstPage = pathname === `/tag/${tag}` || pathname === '/'

  return (
    <nav
      aria-label="Sayfalama"
      className="font-display mt-8 flex flex-wrap items-center gap-2 text-3xl sm:text-4xl"
    >
      {tag ? (
        <Item href={`/tag/${tag}`} active={isActiveFirstPage}>
          1
        </Item>
      ) : (
        <Item href="/" active={isActiveFirstPage}>
          1
        </Item>
      )}

      {PAGES.map((page) => {
        const isActivePage =
          pathname === `/tag/${tag}/${page}` || pathname === `/${page}`

        return tag ? (
          <Item key={page} href={`/tag/${tag}/${page}`} active={isActivePage}>
            {page}
          </Item>
        ) : (
          <Item key={page} href={`/${page}`} active={isActivePage}>
            {page}
          </Item>
        )
      })}
    </nav>
  )
}

function Item({
  active,
  children,
  ...props
}: LinkProps & {
  children: ReactNode
  active: boolean
}) {
  return (
    <Link
      aria-label={`Sayfa ${children}`}
      aria-current={active ? 'page' : undefined}
      className={cx(
        'inline-flex min-h-[2.5rem] min-w-[2.5rem] items-center justify-center rounded-sm text-zinc-500 tabular-nums underline-offset-4 transition-colors duration-150',
        'hover:text-zinc-900',
        'focus-visible:outline-2 focus-visible:outline-offset-2',
        active && 'font-bold text-zinc-900 underline'
      )}
      {...props}
    >
      {children}
    </Link>
  )
}
