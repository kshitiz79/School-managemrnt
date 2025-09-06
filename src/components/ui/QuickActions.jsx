import React from 'react'
import { cn } from '../../lib/utils'
import Button from './Button'
import { Card, CardContent, CardHeader, CardTitle } from './Card'

const QuickActions = ({
  title = 'Quick Actions',
  actions = [],
  variant = 'grid',
  layout = 'horizontal',
  className,
  ...props
}) => {
  if (variant === 'buttons') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)} {...props}>
        {actions.map((action, index) => (
          <Button
            key={action.id || index}
            variant={action.variant || 'outline'}
            size={action.size || 'sm'}
            onClick={action.onClick}
            disabled={action.disabled}
            className={action.className}
          >
            {action.icon && <action.icon className="h-4 w-4 mr-2" />}
            {action.label}
            {action.badge && (
              <span className="ml-2 bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5">
                {action.badge}
              </span>
            )}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <Card className={className} {...props}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'grid gap-3',
            layout === 'grid'
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              : 'grid-cols-1'
          )}
        >
          {actions.map((action, index) => (
            <button
              key={action.id || index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                'flex items-center p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left group',
                action.disabled && 'opacity-50 cursor-not-allowed',
                action.className
              )}
            >
              {action.icon && (
                <div className="flex-shrink-0 mr-3">
                  <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">
                  {action.label}
                </div>
                {action.description && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </div>
                )}
              </div>
              {action.badge && (
                <div className="flex-shrink-0 ml-2">
                  <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5">
                    {action.badge}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default QuickActions
