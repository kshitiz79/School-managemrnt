import React from 'react'
import { useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'
import SidebarGroup from './SidebarGroup'
import SidebarItem from './SidebarItem'
import { getSidebarConfig } from '../../config/sidebar'

const Sidebar = ({
  open,
  collapsed,
  onOpenChange,
  onCollapsedChange,
  userRole,
  className,
  ...props
}) => {
  const location = useLocation()
  const sidebarConfig = getSidebarConfig(userRole)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:w-72 lg:bg-card lg:border-r lg:border-border',
          collapsed && 'lg:w-16',
          className
        )}
        {...props}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div
            className={cn(
              'flex items-center h-16 px-6 border-b border-border',
              collapsed && 'px-4 justify-center'
            )}
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  S
                </span>
              </div>
              {!collapsed && (
                <span className="font-semibold text-foreground">
                  School Management
                </span>
              )}
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin py-4">
            <nav className="px-3 space-y-1">
              {sidebarConfig.map((group, index) => (
                <SidebarGroup
                  key={index}
                  title={group.title}
                  collapsed={collapsed}
                >
                  {group.items.map(item => (
                    <SidebarItem
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      badge={item.badge}
                      active={location.pathname === item.href}
                      collapsed={collapsed}
                    />
                  ))}
                </SidebarGroup>
              ))}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div
            className={cn('border-t border-border p-4', collapsed && 'px-2')}
          >
            <div
              className={cn(
                'text-xs text-muted-foreground',
                collapsed && 'text-center'
              )}
            >
              {collapsed ? 'v1.0' : 'School Management System v1.0'}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  S
                </span>
              </div>
              <span className="font-semibold text-foreground">
                School Management
              </span>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-md hover:bg-muted"
              aria-label="Close sidebar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Sidebar Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin py-4">
            <nav className="px-3 space-y-1">
              {sidebarConfig.map((group, index) => (
                <SidebarGroup key={index} title={group.title} collapsed={false}>
                  {group.items.map(item => (
                    <SidebarItem
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      badge={item.badge}
                      active={location.pathname === item.href}
                      collapsed={false}
                      onClick={() => onOpenChange(false)}
                    />
                  ))}
                </SidebarGroup>
              ))}
            </nav>
          </div>

          {/* Mobile Sidebar Footer */}
          <div className="border-t border-border p-4">
            <div className="text-xs text-muted-foreground">
              School Management System v1.0
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
