import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { USER_ROLES, ROLE_LABELS } from '../constants/auth'
import {
  Bell,
  ChevronDown,
  GraduationCap,
  Home,
  Users,
  BookOpen,
  Calendar,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  UserCheck,
  ClipboardList,
  BarChart3,
  FileText,
  Shield,
  Search,
} from 'lucide-react'
import { cn } from '../lib/utils'
import GlobalSearch from './ui/GlobalSearch'
import NotificationPanel from './ui/NotificationPanel'
import DarkModeToggle from './ui/DarkModeToggle'

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = event => {
      // Cmd/Ctrl + K for search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
      // Escape to close modals
      if (event.key === 'Escape') {
        setSearchOpen(false)
        setNotificationsOpen(false)
        setProfileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleRoleSwitch = newRole => {
    const updatedUser = { ...user, role: newRole }
    updateUser(updatedUser)
    navigate(`/dashboard/${newRole}`)
    setProfileMenuOpen(false)
  }

  // Role-based menu items
  const getMenuItems = role => {
    const commonItems = [
      { name: 'Dashboard', href: `/dashboard/${role}`, icon: Home },
      { name: 'Calendar', href: `/dashboard/${role}/calendar`, icon: Calendar },
      { name: 'Settings', href: `/dashboard/${role}/settings`, icon: Settings },
    ]

    const roleSpecificItems = {
      admin: [
        {
          name: 'Users Management',
          href: '/dashboard/admin/users',
          icon: Users,
        },
        {
          name: 'Schools',
          href: '/dashboard/admin/schools',
          icon: GraduationCap,
        },
        { name: 'Reports', href: '/dashboard/admin/reports', icon: BarChart3 },
        {
          name: 'System Settings',
          href: '/dashboard/admin/system',
          icon: Shield,
        },
      ],
      principal: [
        {
          name: 'Teachers',
          href: '/dashboard/principal/teachers',
          icon: UserCheck,
        },
        {
          name: 'Students',
          href: '/dashboard/principal/students',
          icon: Users,
        },
        {
          name: 'Classes',
          href: '/dashboard/principal/classes',
          icon: BookOpen,
        },
        {
          name: 'Reports',
          href: '/dashboard/principal/reports',
          icon: FileText,
        },
      ],
      teacher: [
        {
          name: 'My Classes',
          href: '/dashboard/teacher/classes',
          icon: BookOpen,
        },
        { name: 'Students', href: '/dashboard/teacher/students', icon: Users },
        {
          name: 'Assignments',
          href: '/dashboard/teacher/assignments',
          icon: ClipboardList,
        },
        { name: 'Grades', href: '/dashboard/teacher/grades', icon: BarChart3 },
      ],
      student: [
        {
          name: 'My Courses',
          href: '/dashboard/student/courses',
          icon: BookOpen,
        },
        {
          name: 'Assignments',
          href: '/dashboard/student/assignments',
          icon: ClipboardList,
        },
        { name: 'Grades', href: '/dashboard/student/grades', icon: BarChart3 },
        {
          name: 'Schedule',
          href: '/dashboard/student/schedule',
          icon: Calendar,
        },
      ],
      parent: [
        {
          name: 'My Children',
          href: '/dashboard/parent/children',
          icon: Users,
        },
        {
          name: 'Academic Progress',
          href: '/dashboard/parent/progress',
          icon: BarChart3,
        },
        {
          name: 'Communications',
          href: '/dashboard/parent/messages',
          icon: FileText,
        },
        { name: 'Events', href: '/dashboard/parent/events', icon: Calendar },
      ],
      accountant: [
        {
          name: 'Fee Management',
          href: '/dashboard/accountant/fees',
          icon: DollarSign,
        },
        {
          name: 'Payments',
          href: '/dashboard/accountant/payments',
          icon: DollarSign,
        },
        {
          name: 'Reports',
          href: '/dashboard/accountant/reports',
          icon: FileText,
        },
        {
          name: 'Budgets',
          href: '/dashboard/accountant/budgets',
          icon: BarChart3,
        },
      ],
    }

    return [
      ...commonItems.slice(0, 1), // Dashboard first
      ...(roleSpecificItems[role] || []),
      ...commonItems.slice(1), // Calendar and Settings last
    ]
  }

  const menuItems = getMenuItems(user?.role || 'student')

  const availableRoles = Object.values(USER_ROLES)

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Global Search Modal */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Notifications Panel */}
      <NotificationPanel
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
              EduManage
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {menuItems.map(item => {
              const isActive = location.pathname === item.href
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href)
                    setSidebarOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white',
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="ml-4 lg:ml-0">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {user?.role} Dashboard
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Global Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Search"
              >
                <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Dark Mode Toggle */}
              <DarkModeToggle />

              {/* Notifications */}
              <button
                onClick={() => setNotificationsOpen(true)}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 relative transition-colors"
                title="Notifications"
              >
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile menu */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user?.role}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>

                {/* Profile dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Switch Role
                        </p>
                      </div>
                      {availableRoles.map(role => (
                        <button
                          key={role}
                          onClick={() => handleRoleSwitch(role)}
                          className={cn(
                            'w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700',
                            user?.role === role
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                              : 'text-gray-700 dark:text-gray-300',
                          )}
                        >
                          {ROLE_LABELS[role]}
                        </button>
                      ))}
                      <div className="border-t border-gray-100 dark:border-gray-700">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default AppLayout
