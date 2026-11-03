'use client'

import Link, { LinkProps } from 'next/link'
import cx from '@/utils/cx'
import { HTMLAttributes } from 'react'
import { usePathname } from 'next/navigation'

export default function AppNav({ tags }: { tags: string[] }) {
  return (
    <nav
      aria-label="Kategori navigasyonu"
      className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2"
    >
      <AppNavItem href="/">Tümü</AppNavItem>
      {tags.map((tag) => (
        <AppNavItem href={`/tag/${tag}`} key={tag}>
          {tag}
        </AppNavItem>
      ))}
    </nav>
  )
}

function AppNavItem({
  className,
  children,
  ...props
}: LinkProps & HTMLAttributes<HTMLAnchorElement>) {
  const pathname = usePathname()
  const isActive =
    pathname === props.href ||
    (props.href !== '/' && pathname.startsWith(`${props.href}/`))

  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      className={cx(
        'font-display rounded-sm py-0.5 text-xl text-zinc-600 capitalize underline-offset-4 transition-colors duration-150',
        'hover:text-zinc-900 hover:underline',
        'focus-visible:outline-2 focus-visible:outline-offset-2',
        isActive && 'font-bold text-zinc-900 underline',
        className
      )}
      {...props}
    >
      {children}
    </Link>
  )
}
