import React from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'
import Badge from '../ui/Badge'

const SidebarItem = ({
  href,
  icon: Icon,
  label,
  badge,
  active = false,
  collapsed = false,
  onClick,
  className,
  ...props
}) => {
  const content = (
    <>
      {Icon && (
        <Icon
          className={cn(
            'h-5 w-5 flex-shrink-0',
            collapsed ? 'mx-auto' : 'mr-3'
          )}
        />
      )}
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {!collapsed && badge && (
        <Badge variant="secondary" size="sm">
          {badge}
        </Badge>
      )}
    </>
  )

  const itemClasses = cn(
    'sidebar-item',
    active && 'active',
    collapsed && 'justify-center px-2',
    className
  )

  if (href) {
    return (
      <Link
        to={href}
        className={itemClasses}
        onClick={onClick}
        title={collapsed ? label : undefined}
        {...props}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      className={itemClasses}
      onClick={onClick}
      title={collapsed ? label : undefined}
      {...props}
    >
      {content}
    </button>
  )
}

export default SidebarItem
