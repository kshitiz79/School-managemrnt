import {
  UserCheck,
  Users,
  BookOpen,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import { withRoleGuard } from '../guards/withRoleGuard.jsx'
import { USER_ROLES } from '../constants/auth'

const PrincipalDashboard = () => {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Principal Dashboard
          </h1>
          <p className="text-gray-600">
            Oversee school operations, staff, and student performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCheck className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Teachers
                </p>
                <p className="text-2xl font-semibold text-gray-900">45</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Students
                </p>
                <p className="text-2xl font-semibold text-gray-900">1,247</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Active Classes
                </p>
                <p className="text-2xl font-semibold text-gray-900">68</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Attendance Rate
                </p>
                <p className="text-2xl font-semibold text-gray-900">94.2%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                School Performance
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average GPA</span>
                  <span className="text-sm font-medium text-green-600">
                    3.6
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Graduation Rate</span>
                  <span className="text-sm font-medium text-blue-600">96%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    College Acceptance
                  </span>
                  <span className="text-sm font-medium text-purple-600">
                    89%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Parent Satisfaction
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    4.7/5
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Recent Activities
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      New teacher hired
                    </p>
                    <p className="text-xs text-gray-500">
                      Mathematics Department - 2 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Parent meeting scheduled
                    </p>
                    <p className="text-xs text-gray-500">
                      Grade 12 parents - Tomorrow 3:00 PM
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Budget review completed
                    </p>
                    <p className="text-xs text-gray-500">
                      Q2 financial report - Yesterday
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Alerts & Notifications
              </h3>
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-red-900">
                    Low attendance alert
                  </p>
                  <p className="text-xs text-red-700">
                    Grade 9B has 78% attendance this week
                  </p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  High Priority
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Equipment maintenance due
                  </p>
                  <p className="text-xs text-yellow-700">
                    Science lab equipment needs inspection
                  </p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Medium Priority
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    New enrollment applications
                  </p>
                  <p className="text-xs text-blue-700">
                    15 new applications for next semester
                  </p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Info
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withRoleGuard([USER_ROLES.PRINCIPAL])(PrincipalDashboard)
