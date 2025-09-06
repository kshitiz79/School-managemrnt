import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import ErrorState from '../components/ui/ErrorState'

const RoleGuard = ({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  fallback = null,
  redirectTo = '/unauthorized',
}) => {
  const { user, isAuthenticated, loading, hasRole, hasPermission } = useAuth()
  const location = useLocation()

  // Show loading while checking authentication
  if (loading) {
    return <LoadingSkeleton.Dashboard />
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role permissions
  const hasRequiredRole = allowedRoles.length === 0 || hasRole(allowedRoles)

  // Check specific permissions
  const hasRequiredPermissions =
    requiredPermissions.length === 0 ||
    requiredPermissions.every(permission => hasPermission(permission))

  // If user doesn't have required role or permissions
  if (!hasRequiredRole || !hasRequiredPermissions) {
    if (fallback) {
      return fallback
    }

    if (redirectTo === '/unauthorized') {
      return (
        <ErrorState
          title="Access Denied"
          description="You don't have permission to access this resource."
          showHome={true}
          onHome={() => (window.location.href = `/dashboard/${user.role}`)}
        />
      )
    }

    return <Navigate to={redirectTo} replace />
  }

  return children
}

// Custom hook for role checking
export const useRoleCheck = () => {
  const { user, hasRole, hasPermission } = useAuth()

  if (!user) {
    return {
      isAdmin: false,
      isPrincipal: false,
      isTeacher: false,
      isStudent: false,
      isParent: false,
      isAccountant: false,
      isStaff: false,
      canManageUsers: false,
    }
  }

  const isAdmin = hasRole('admin')
  const isPrincipal = hasRole('principal')
  const isTeacher = hasRole('teacher')
  const isStudent = hasRole('student')
  const isParent = hasRole('parent')
  const isAccountant = hasRole('accountant')
  const isStaff = hasRole(['teacher', 'principal', 'admin'])
  const canManageUsers = hasPermission('user:manage') || isAdmin

  return {
    isAdmin,
    isPrincipal,
    isTeacher,
    isStudent,
    isParent,
    isAccountant,
    isStaff,
    canManageUsers,
  }
}

export default RoleGuard
