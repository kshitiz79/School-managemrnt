import RoleGuard, { useRoleCheck } from '../guards/RoleGuard'
import { USER_ROLES } from '../constants/auth'
import { useAuth } from '../contexts/AuthContext'
import {
  Shield,
  Users,
  DollarSign,
  BookOpen,
  UserCheck,
  GraduationCap,
} from 'lucide-react'

/**
 * Example component demonstrating role-based content rendering
 */
const RoleBasedContent = () => {
  const { user } = useAuth()
  const {
    isAdmin,
    isPrincipal,
    isTeacher,
    isStudent,
    isParent,
    isAccountant,
    isStaff,
    canManageUsers,
  } = useRoleCheck()

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Role-Based Content Demo
        </h2>
        <p className="text-gray-600 mb-4">
          Current user: <span className="font-medium">{user?.name}</span> (
          {user?.role})
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Admin Only Content */}
          <RoleGuard allowedRoles={[USER_ROLES.ADMIN]}>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Shield className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="font-medium text-red-900">Admin Only</h3>
              </div>
              <p className="text-sm text-red-700">
                This content is only visible to administrators.
              </p>
            </div>
          </RoleGuard>

          {/* Principal Only Content */}
          <RoleGuard allowedRoles={[USER_ROLES.PRINCIPAL]}>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <GraduationCap className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="font-medium text-purple-900">Principal Only</h3>
              </div>
              <p className="text-sm text-purple-700">
                School management tools for principals.
              </p>
            </div>
          </RoleGuard>

          {/* Teacher Only Content */}
          <RoleGuard allowedRoles={[USER_ROLES.TEACHER]}>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-medium text-blue-900">Teacher Only</h3>
              </div>
              <p className="text-sm text-blue-700">
                Classroom management and grading tools.
              </p>
            </div>
          </RoleGuard>

          {/* Student Only Content */}
          <RoleGuard allowedRoles={[USER_ROLES.STUDENT]}>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Users className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-medium text-green-900">Student Only</h3>
              </div>
              <p className="text-sm text-green-700">
                Course materials and assignment submissions.
              </p>
            </div>
          </RoleGuard>

          {/* Parent Only Content */}
          <RoleGuard allowedRoles={[USER_ROLES.PARENT]}>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <UserCheck className="h-5 w-5 text-yellow-600 mr-2" />
                <h3 className="font-medium text-yellow-900">Parent Only</h3>
              </div>
              <p className="text-sm text-yellow-700">
                Track your children's academic progress.
              </p>
            </div>
          </RoleGuard>

          {/* Accountant Only Content */}
          <RoleGuard allowedRoles={[USER_ROLES.ACCOUNTANT]}>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <DollarSign className="h-5 w-5 text-indigo-600 mr-2" />
                <h3 className="font-medium text-indigo-900">Accountant Only</h3>
              </div>
              <p className="text-sm text-indigo-700">
                Financial management and reporting tools.
              </p>
            </div>
          </RoleGuard>
        </div>

        {/* Multi-role Content */}
        <div className="mt-6 space-y-4">
          <RoleGuard allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.PRINCIPAL]}>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                Management Tools
              </h3>
              <p className="text-sm text-gray-700">
                This content is visible to both administrators and principals.
              </p>
            </div>
          </RoleGuard>

          <RoleGuard allowedRoles={[USER_ROLES.TEACHER, USER_ROLES.STUDENT]}>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">
                Academic Content
              </h3>
              <p className="text-sm text-blue-700">
                This content is visible to both teachers and students.
              </p>
            </div>
          </RoleGuard>
        </div>

        {/* Role Check Hooks Demo */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Role Check Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div
              className={`p-2 rounded ${isAdmin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              Admin: {isAdmin ? '✓' : '✗'}
            </div>
            <div
              className={`p-2 rounded ${isPrincipal ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              Principal: {isPrincipal ? '✓' : '✗'}
            </div>
            <div
              className={`p-2 rounded ${isTeacher ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              Teacher: {isTeacher ? '✓' : '✗'}
            </div>
            <div
              className={`p-2 rounded ${isStudent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              Student: {isStudent ? '✓' : '✗'}
            </div>
            <div
              className={`p-2 rounded ${isParent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              Parent: {isParent ? '✓' : '✗'}
            </div>
            <div
              className={`p-2 rounded ${isAccountant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              Accountant: {isAccountant ? '✓' : '✗'}
            </div>
            <div
              className={`p-2 rounded ${isStaff ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              Staff: {isStaff ? '✓' : '✗'}
            </div>
            <div
              className={`p-2 rounded ${canManageUsers ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              Can Manage: {canManageUsers ? '✓' : '✗'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoleBasedContent
