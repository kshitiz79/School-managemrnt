import { BookOpen, ClipboardList, BarChart3, Calendar } from 'lucide-react'
import { withRoleGuard } from '../guards/withRoleGuard.jsx'
import { USER_ROLES } from '../constants/auth'

const StudentDashboard = () => {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Student Dashboard
          </h1>
          <p className="text-gray-600">
            Track your courses, assignments, and academic progress
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Enrolled Courses
                </p>
                <p className="text-2xl font-semibold text-gray-900">8</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardList className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Pending Assignments
                </p>
                <p className="text-2xl font-semibold text-gray-900">5</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Overall GPA</p>
                <p className="text-2xl font-semibold text-gray-900">3.8</p>
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
                  Upcoming Exams
                </p>
                <p className="text-2xl font-semibold text-gray-900">3</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Today's Classes
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">
                    9:00 AM
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Mathematics
                    </p>
                    <p className="text-xs text-gray-500">
                      Mr. Johnson - Room 201
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-900">
                    11:00 AM
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      English Literature
                    </p>
                    <p className="text-xs text-gray-500">
                      Ms. Davis - Room 105
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="text-sm font-medium text-yellow-900">
                    2:00 PM
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Physics</p>
                    <p className="text-xs text-gray-500">Dr. Smith - Lab 3</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Recent Grades
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Math Quiz #3
                    </p>
                    <p className="text-xs text-gray-500">Mathematics</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    A-
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Essay Assignment
                    </p>
                    <p className="text-xs text-gray-500">English Literature</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    B+
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Lab Report
                    </p>
                    <p className="text-xs text-gray-500">Physics</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    A
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withRoleGuard([USER_ROLES.STUDENT])(StudentDashboard)
