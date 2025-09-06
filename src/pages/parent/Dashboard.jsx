import { Users, BarChart3, FileText, Calendar } from 'lucide-react'
import { withRoleGuard } from '../guards/withRoleGuard.jsx'
import { USER_ROLES } from '../constants/auth'

const ParentDashboard = () => {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
          <p className="text-gray-600">
            Monitor your children's academic progress and school activities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">My Children</p>
                <p className="text-2xl font-semibold text-gray-900">2</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average GPA</p>
                <p className="text-2xl font-semibold text-gray-900">3.7</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Unread Messages
                </p>
                <p className="text-2xl font-semibold text-gray-900">4</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Upcoming Events
                </p>
                <p className="text-2xl font-semibold text-gray-900">6</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Children's Progress
              </h3>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Emma Johnson</h4>
                    <span className="text-sm text-gray-500">Grade 10</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Mathematics</span>
                      <span className="font-medium text-green-600">A-</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>English</span>
                      <span className="font-medium text-blue-600">B+</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Science</span>
                      <span className="font-medium text-green-600">A</span>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      Michael Johnson
                    </h4>
                    <span className="text-sm text-gray-500">Grade 8</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Mathematics</span>
                      <span className="font-medium text-blue-600">B</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>English</span>
                      <span className="font-medium text-green-600">A-</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>History</span>
                      <span className="font-medium text-blue-600">B+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Recent Communications
              </h3>
              <div className="space-y-3">
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      Parent-Teacher Conference
                    </p>
                    <span className="text-xs text-gray-500">2 days ago</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Scheduled for next Friday at 3:00 PM
                  </p>
                </div>

                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      Field Trip Permission
                    </p>
                    <span className="text-xs text-gray-500">1 week ago</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Science museum visit requires signed form
                  </p>
                </div>

                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      Grade Report Available
                    </p>
                    <span className="text-xs text-gray-500">1 week ago</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Quarter 2 grades are now available
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withRoleGuard([USER_ROLES.PARENT])(ParentDashboard)
