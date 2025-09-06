import React from 'react'
import { cn } from '../../lib/utils'

const SidebarGroup = ({
  title,
  children,
  collapsed = false,
  className,
  ...props
}) => {
  return (
    <div className={cn('sidebar-group', className)} {...props}>
      {title && !collapsed && (
        <div className="sidebar-group-title">{title}</div>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  )
}

export default SidebarGroup
