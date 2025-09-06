import React, { useState } from 'react'
import {
  Bell,
  X,
  Check,
  AlertCircle,
  Info,
  Calendar,
  User,
  Filter,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '../ui/Drawer'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs'
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from '../ui/Dropdown'

const mockNotifications = [
  {
    id: 'notif-1',
    type: 'assignment',
    title: 'New Assignment Posted',
    message: 'Mathematics homework has been assigned for Class 10-A',
    timestamp: '2024-02-08T10:30:00Z',
    read: false,
    priority: 'medium',
    actionUrl: '/dashboard/student/assignments',
  },
  {
    id: 'notif-2',
    type: 'fee',
    title: 'Fee Payment Due',
    message: 'Monthly tuition fee payment is due in 3 days',
    timestamp: '2024-02-08T09:15:00Z',
    read: false,
    priority: 'high',
    actionUrl: '/dashboard/parent/fees',
  },
  {
    id: 'notif-3',
    type: 'event',
    title: 'Parent-Teacher Meeting',
    message: 'Scheduled for February 15th, 2024 at 2:00 PM',
    timestamp: '2024-02-07T16:45:00Z',
    read: true,
    priority: 'medium',
    actionUrl: '/dashboard/parent/events',
  },
  {
    id: 'notif-4',
    type: 'grade',
    title: 'Exam Results Published',
    message: 'Mid-term examination results are now available',
    timestamp: '2024-02-07T14:20:00Z',
    read: true,
    priority: 'low',
    actionUrl: '/dashboard/student/grades',
  },
  {
    id: 'notif-5',
    type: 'attendance',
    title: 'Attendance Alert',
    message: 'Your attendance is below 75% this month',
    timestamp: '2024-02-06T11:00:00Z',
    read: false,
    priority: 'high',
    actionUrl: '/dashboard/student/attendance',
  },
]

const NotificationPanel = ({ open, onOpenChange }) => {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [filter, setFilter] = useState('all')

  const getIcon = type => {
    switch (type) {
      case 'assignment':
        return AlertCircle
      case 'fee':
        return AlertCircle
      case 'event':
        return Calendar
      case 'grade':
        return Check
      case 'attendance':
        return User
      default:
        return Info
    }
  }

  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 dark:bg-red-950'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950'
      case 'low':
        return 'text-green-600 bg-green-50 dark:bg-green-950'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-950'
    }
  }

  const formatTimestamp = timestamp => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  const markAsRead = id => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif)),
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
  }

  const deleteNotification = id => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read
    if (filter === 'high') return notif.priority === 'high'
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Drawer open={open} onOpenChange={onOpenChange} side="right">
      <DrawerContent className="w-96">
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <DrawerTitle>Notifications</DrawerTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" size="sm">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Dropdown>
                <DropdownTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownContent>
                  <DropdownItem onClick={() => setFilter('all')}>
                    All Notifications
                  </DropdownItem>
                  <DropdownItem onClick={() => setFilter('unread')}>
                    Unread Only
                  </DropdownItem>
                  <DropdownItem onClick={() => setFilter('high')}>
                    High Priority
                  </DropdownItem>
                </DropdownContent>
              </Dropdown>
              <DrawerClose />
            </div>
          </div>

          {unreadCount > 0 && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            </div>
          )}
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredNotifications.map(notification => {
                const Icon = getIcon(notification.type)
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 hover:bg-muted/50 cursor-pointer transition-colors group',
                      !notification.read && 'bg-muted/30'
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={cn(
                          'flex-shrink-0 p-2 rounded-full',
                          getPriorityColor(notification.priority)
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p
                            className={cn(
                              'text-sm font-medium truncate',
                              !notification.read
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            )}
                          >
                            {notification.title}
                          </p>
                          <Dropdown>
                            <DropdownTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownContent>
                              <DropdownItem
                                onClick={() => markAsRead(notification.id)}
                              >
                                Mark as read
                              </DropdownItem>
                              <DropdownItem
                                onClick={() =>
                                  deleteNotification(notification.id)
                                }
                                className="text-destructive"
                              >
                                Delete
                              </DropdownItem>
                            </DropdownContent>
                          </Dropdown>
                        </div>

                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                notification.priority === 'high'
                                  ? 'destructive'
                                  : notification.priority === 'medium'
                                    ? 'warning'
                                    : 'secondary'
                              }
                              size="sm"
                            >
                              {notification.priority}
                            </Badge>
                            {!notification.read && (
                              <div className="h-2 w-2 bg-primary rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No notifications
              </h3>
              <p className="text-sm text-muted-foreground">
                {filter === 'unread'
                  ? "You're all caught up! No unread notifications."
                  : 'You have no notifications at the moment.'}
              </p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default NotificationPanel
