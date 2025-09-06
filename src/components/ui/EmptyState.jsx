import React from 'react'
import {
  FileX,
  Users,
  BookOpen,
  Calendar,
  DollarSign,
  Bell,
  Search,
  Database,
  Inbox,
  AlertCircle,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import Button from './Button'

const EmptyState = ({
  variant = 'default',
  title,
  description,
  icon: CustomIcon,
  action,
  className,
  ...props
}) => {
  const variants = {
    default: {
      icon: FileX,
      title: 'No data found',
      description: 'There is no data to display at the moment.',
    },
    users: {
      icon: Users,
      title: 'No users found',
      description: 'No users match your current filters.',
    },
    students: {
      icon: Users,
      title: 'No students found',
      description: 'No students have been added yet.',
    },
    courses: {
      icon: BookOpen,
      title: 'No courses found',
      description: 'No courses are available at the moment.',
    },
    events: {
      icon: Calendar,
      title: 'No events found',
      description: 'No events are scheduled.',
    },
    financial: {
      icon: DollarSign,
      title: 'No financial data',
      description: 'No financial records found.',
    },
    notifications: {
      icon: Bell,
      title: 'No notifications',
      description: 'You have no new notifications.',
    },
    search: {
      icon: Search,
      title: 'No results found',
      description: 'Try adjusting your search criteria.',
    },
    database: {
      icon: Database,
      title: 'No records found',
      description: 'The database is empty.',
    },
    inbox: {
      icon: Inbox,
      title: 'Inbox is empty',
      description: 'No messages to display.',
    },
    error: {
      icon: AlertCircle,
      title: 'Something went wrong',
      description: 'An error occurred while loading data.',
    },
  }

  const config = variants[variant] || variants.default
  const Icon = CustomIcon || config.icon
  const displayTitle = title || config.title
  const displayDescription = description || config.description

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 space-y-4',
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          {displayTitle}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {displayDescription}
        </p>
      </div>

      {action && <div className="pt-2">{action}</div>}
    </div>
  )
}

export default EmptyState
