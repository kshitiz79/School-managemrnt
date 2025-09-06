import { useState } from 'react'
import { Bell, X, Check, AlertCircle, Info, Calendar, User } from 'lucide-react'
import { cn } from '../../lib/utils'

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

const NotificationPanel = ({ isOpen, onClose }) => {
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
        return 'text-red-600 bg-red-50'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'low':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-gray-600 bg-gray-50'
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end pt-16 pr-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-96 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {unreadCount}
                </span>
              )}
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
                { key: 'high', label: 'Priority' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                    filter === tab.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map(notification => {
                const Icon = getIcon(notification.type)
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 hover:bg-gray-50 cursor-pointer transition-colors',
                      !notification.read && 'bg-blue-50'
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start">
                      <div
                        className={cn(
                          'flex-shrink-0 p-2 rounded-full mr-3',
                          getPriorityColor(notification.priority)
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p
                            className={cn(
                              'text-sm font-medium truncate',
                              !notification.read
                                ? 'text-gray-900'
                                : 'text-gray-700'
                            )}
                          >
                            {notification.title}
                          </p>
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="ml-2 p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3 text-gray-400" />
                          </button>
                        </div>

                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No notifications found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationPanel
