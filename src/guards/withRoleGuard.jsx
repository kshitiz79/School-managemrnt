import React from 'react'
import RoleGuard from './RoleGuard'

/**
 * Higher-Order Component that wraps a component with role-based access control
 * @param {string[]} allowedRoles - Array of roles that can access the component
 * @param {string[]} requiredPermissions - Array of permissions required to access the component
 * @param {Object} options - Additional options for the role guard
 */
export const withRoleGuard = (
  allowedRoles = [],
  requiredPermissions = [],
  options = {}
) => {
  return function WithRoleGuardComponent(WrappedComponent) {
    const ComponentWithRoleGuard = props => {
      return (
        <RoleGuard
          allowedRoles={allowedRoles}
          requiredPermissions={requiredPermissions}
          {...options}
        >
          <WrappedComponent {...props} />
        </RoleGuard>
      )
    }

    // Set display name for debugging
    ComponentWithRoleGuard.displayName = `withRoleGuard(${WrappedComponent.displayName || WrappedComponent.name})`

    return ComponentWithRoleGuard
  }
}

export default withRoleGuard
