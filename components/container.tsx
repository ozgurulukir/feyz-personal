import { HTMLAttributes, ReactNode } from 'react'
import cx from '@/utils/cx'

export interface IContainer extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export default function Container({
  children,
  className,
  ...props
}: IContainer) {
  return (
    <div className={cx('mx-auto max-w-screen-md px-6', className)} {...props}>
      {children}
    </div>
  )
}
