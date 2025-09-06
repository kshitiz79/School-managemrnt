import React from 'react'
import { cn } from '../../lib/utils'

const RadioGroup = ({ children, className, ...props }) => {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {children}
    </div>
  )
}

const Radio = React.forwardRef(
  ({ className, label, error, helperText, ...props }, ref) => {
    const radioId = React.useId()

    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            id={radioId}
            type="radio"
            className={cn(
              'h-4 w-4 rounded-full border border-primary text-primary shadow focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive',
              className
            )}
            ref={ref}
            {...props}
          />
          {label && (
            <label
              htmlFor={radioId}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {label}
            </label>
          )}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    )
  }
)

Radio.displayName = 'Radio'

export { Radio, RadioGroup }
