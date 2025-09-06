import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Settings,
  LogOut,
  Shield,
  Bell,
  HelpCircle,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { USER_ROLES, ROLE_LABELS } from '../../constants/auth'
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
} from '../ui/Dropdown'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

const UserMenu = () => {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleRoleSwitch = newRole => {
    const updatedUser = { ...user, role: newRole }
    updateUser(updatedUser)
    navigate(`/dashboard/${newRole}`)
  }

  const getUserInitials = () => {
    if (!user?.name) return 'U'
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadgeVariant = role => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'principal':
        return 'default'
      case 'teacher':
        return 'secondary'
      case 'student':
        return 'info'
      case 'parent':
        return 'warning'
      case 'accountant':
        return 'success'
      default:
        return 'outline'
    }
  }

  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <span className="text-sm font-medium">{getUserInitials()}</span>
          </div>
        </Button>
      </DropdownTrigger>

      <DropdownContent className="w-80" align="end">
        {/* User Info */}
        <div className="flex items-center space-x-3 p-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <span className="text-sm font-medium">{getUserInitials()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || 'user@example.com'}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={getRoleBadgeVariant(user?.role)} size="sm">
                {ROLE_LABELS[user?.role] || 'User'}
              </Badge>
              {user?.status === 'online' && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <DropdownSeparator />

        {/* Profile Actions */}
        <DropdownItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownItem>

        <DropdownItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownItem>

        <DropdownItem>
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
        </DropdownItem>

        <DropdownSeparator />

        {/* Role Switching */}
        <DropdownLabel>Switch Role</DropdownLabel>
        {Object.values(USER_ROLES).map(role => (
          <DropdownItem
            key={role}
            onClick={() => handleRoleSwitch(role)}
            className={user?.role === role ? 'bg-muted' : ''}
          >
            <Shield className="mr-2 h-4 w-4" />
            <span className="flex-1">{ROLE_LABELS[role]}</span>
            {user?.role === role && (
              <Badge variant="outline" size="sm">
                Current
              </Badge>
            )}
          </DropdownItem>
        ))}

        <DropdownSeparator />

        {/* Help & Support */}
        <DropdownItem>
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </DropdownItem>

        <DropdownSeparator />

        {/* Logout */}
        <DropdownItem onClick={handleLogout} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  )
}

export default UserMenu
