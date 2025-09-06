import React from 'react'
import { cn } from '../../lib/utils'

const Badge = React.forwardRef(
  (
    { className, variant = 'default', size = 'md', children, ...props },
    ref
  ) => {
    const variants = {
      default: 'badge-default',
      secondary: 'badge-secondary',
      destructive: 'badge-destructive',
      outline: 'badge-outline',
      success: 'border-transparent bg-green-500 text-white hover:bg-green-600',
      warning:
        'border-transparent bg-yellow-500 text-white hover:bg-yellow-600',
      info: 'border-transparent bg-blue-500 text-white hover:bg-blue-600',
    }

    const sizes = {
      sm: 'text-xs px-2 py-0.5',
      md: 'text-xs px-2.5 py-0.5',
      lg: 'text-sm px-3 py-1',
    }

    return (
      <div
        ref={ref}
        className={cn('badge', variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Badge.displayName = 'Badge'

export default Badge
