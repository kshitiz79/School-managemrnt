import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lessonPlanApi } from '../../lib/api/lessonPlan'
import Button from '../../components/Button'
import { exportToCSV, exportToPDF } from '../../lib/export'

const ManageLessonPlan = () => {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [filters, setFilters] = useState({
    subject: 'all',
    class: 'all',
    teacher: 'all',
    status: 'all',
    academicYear: new Date().getFullYear(),
  })
  const [viewMode, setViewMode] = useState('grid') // grid, timeline, calendar

  const queryClient = useQueryClient()

  const { data: lessonPlansResponse, isLoading } = useQuery({
    queryKey: ['lessonPlans', filters],
    queryFn: () => lessonPlanApi.getLessonPlans(filters),
  })

  // Safely extract lesson plans from API response
  const lessonPlans = useMemo(() => {
    if (Array.isArray(lessonPlansResponse)) {
      return lessonPlansResponse
    }
    if (lessonPlansResponse?.data && Array.isArray(lessonPlansResponse.data)) {
      return lessonPlansResponse.data
    }
    return []
  }, [lessonPlansResponse])

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: lessonPlanApi.getSubjects,
  })

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: lessonPlanApi.getClasses,
  })

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: lessonPlanApi.getTeachers,
  })

  const { data: planDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['lessonPlanDetails', selectedPlan],
    queryFn: () => lessonPlanApi.getLessonPlanDetails(selectedPlan),
    enabled: !!selectedPlan,
  })

  const approvePlanMutation = useMutation({
    mutationFn: ({ id, status, comments }) =>
      lessonPlanApi.approveLessonPlan(id, status, comments),
    onSuccess: () => {
      queryClient.invalidateQueries(['lessonPlans'])
      alert('Lesson plan status updated successfully!')
    },
  })

  const bulkApproveMutation = useMutation({
    mutationFn: lessonPlanApi.bulkApproveLessonPlans,
    onSuccess: () => {
      queryClient.invalidateQueries(['lessonPlans'])
      alert('Bulk approval completed!')
    },
  })

  const handleFilterChange = e => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleApproval = (id, status, comments = '') => {
    approvePlanMutation.mutate({ id, status, comments })
  }

  const handleExport = () => {
    const exportData = Array.isArray(lessonPlans)
      ? lessonPlans.map(plan => ({
          'Plan Title': plan.title,
          Subject: plan.subjectName,
          Class: plan.className,
          Teacher: plan.teacherName,
          Status: plan.status,
          'Lessons Count': plan.lessonsCount,
          Progress: `${plan.completedLessons}/${plan.totalLessons}`,
          'Created Date': plan.createdAt,
        }))
      : []
    exportToCSV(exportData, 'lesson-plans')
  }

  const getStatusColor = status => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressColor = percentage => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-yellow-500'
    if (percentage >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const renderTimelineView = () => {
    const sortedPlans = Array.isArray(lessonPlans)
      ? [...lessonPlans].sort(
          (a, b) => new Date(a.startDate) - new Date(b.startDate)
        )
      : []

    return (
      <div className="space-y-4">
        {Array.isArray(sortedPlans) &&
          sortedPlans.map((plan) => {
            const progress =
              plan.totalLessons > 0
                ? (plan.completedLessons / plan.totalLessons) * 100
                : 0
            const startDate = new Date(plan.startDate)
            const endDate = new Date(plan.endDate)
            const duration = Math.ceil(
              (endDate - startDate) / (1000 * 60 * 60 * 24),
            )

            return (
              <div
                key={plan.id}
                className="flex items-center space-x-4 p-4 bg-white rounded-lg border"
              >
                <div className="flex-shrink-0 w-2 h-16 bg-blue-500 rounded"></div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{plan.title}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs ${getStatusColor(plan.status)}`}
                    >
                      {plan.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Subject:</span>{' '}
                      {plan.subjectName}
                    </div>
                    <div>
                      <span className="font-medium">Class:</span>{' '}
                      {plan.className}
                    </div>
                    <div>
                      <span className="font-medium">Teacher:</span>{' '}
                      {plan.teacherName}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {duration}{' '}
                      days
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>
                        Progress: {plan.completedLessons}/{plan.totalLessons}{' '}
                        lessons
                      </span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(progress)}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {startDate.toLocaleDateString()} -{' '}
                      {endDate.toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedPlan(plan.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        View Details
                      </Button>
                      {plan.status === 'submitted' && (
                        <>
                          <Button
                            onClick={() => handleApproval(plan.id, 'approved')}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleApproval(plan.id, 'rejected')}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
      </div>
    )
  }

  const renderGridView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(lessonPlans) &&
          lessonPlans.map(plan => {
            const progress =
              plan.totalLessons > 0
                ? (plan.completedLessons / plan.totalLessons) * 100
                : 0

            return (
              <div
                key={plan.id}
                className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold line-clamp-2">
                    {plan.title}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded text-xs ${getStatusColor(plan.status)}`}
                  >
                    {plan.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div>
                    <span className="font-medium">Subject:</span>{' '}
                    {plan.subjectName}
                  </div>
                  <div>
                    <span className="font-medium">Class:</span> {plan.className}
                  </div>
                  <div>
                    <span className="font-medium">Teacher:</span>{' '}
                    {plan.teacherName}
                  </div>
                  <div>
                    <span className="font-medium">Lessons:</span>{' '}
                    {plan.totalLessons}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(progress)}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setSelectedPlan(plan.id)}
                    className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    View
                  </Button>
                  {plan.status === 'submitted' && (
                    <>
                      <Button
                        onClick={() => handleApproval(plan.id, 'approved')}
                        className="bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700"
                      >
                        ✓
                      </Button>
                      <Button
                        onClick={() => handleApproval(plan.id, 'rejected')}
                        className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700"
                      >
                        ✗
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📋</span>
            <h2 className="text-2xl font-bold">Manage Lesson Plans</h2>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Export CSV
            </Button>

            <div className="flex bg-gray-200 rounded-md">
              <Button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-l-md ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
              >
                Grid
              </Button>
              <Button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-2 rounded-r-md ${viewMode === 'timeline' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
              >
                Timeline
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-700">
              {Array.isArray(lessonPlans) ? lessonPlans.filter(p => p.status === 'draft').length : 0}
            </div>
            <div className="text-sm text-blue-600">Draft</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-700">
              {Array.isArray(lessonPlans) ? lessonPlans.filter(p => p.status === 'submitted').length : 0}
            </div>
            <div className="text-sm text-yellow-600">Submitted</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-700">
              {Array.isArray(lessonPlans) ? lessonPlans.filter(p => p.status === 'approved').length : 0}
            </div>
            <div className="text-sm text-green-600">Approved</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-700">
              {Array.isArray(lessonPlans) ? lessonPlans.filter(p => p.status === 'in_progress').length : 0}
            </div>
            <div className="text-sm text-purple-600">In Progress</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-700">
              {Array.isArray(lessonPlans) ? lessonPlans.filter(p => p.status === 'completed').length : 0}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <select
              name="subject"
              value={filters.subject}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="all">All Subjects</option>
              {Array.isArray(subjects) &&
                subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Class</label>
            <select
              name="class"
              value={filters.class}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="all">All Classes</option>
              {Array.isArray(classes) &&
                classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Teacher</label>
            <select
              name="teacher"
              value={filters.teacher}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="all">All Teachers</option>
              {Array.isArray(teachers) &&
                teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Academic Year
            </label>
            <select
              name="academicYear"
              value={filters.academicYear}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md"
            >
              <option value={new Date().getFullYear()}>
                {new Date().getFullYear()}
              </option>
              <option value={new Date().getFullYear() - 1}>
                {new Date().getFullYear() - 1}
              </option>
              <option value={new Date().getFullYear() + 1}>
                {new Date().getFullYear() + 1}
              </option>
            </select>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-8">Loading lesson plans...</div>
        ) : !Array.isArray(lessonPlans) || lessonPlans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-6xl mb-4">📋</div>
            <div className="text-xl mb-2">No lesson plans found</div>
            <div className="text-sm">
              No lesson plans match the selected filters
            </div>
          </div>
        ) : (
          <>{viewMode === 'grid' ? renderGridView() : renderTimelineView()}</>
        )}

        {/* Plan Details Modal */}
        {selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Lesson Plan Details</h3>
                <Button
                  onClick={() => setSelectedPlan(null)}
                  className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                >
                  Close
                </Button>
              </div>

              {isLoadingDetails ? (
                <div className="text-center py-4">Loading details...</div>
              ) : (
                planDetails && (
                  <div className="space-y-6">
                    {/* Plan Overview */}
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-semibold mb-3">Plan Overview</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium">Title:</span>{' '}
                          {planDetails.title}
                        </div>
                        <div>
                          <span className="font-medium">Subject:</span>{' '}
                          {planDetails.subjectName}
                        </div>
                        <div>
                          <span className="font-medium">Class:</span>{' '}
                          {planDetails.className}
                        </div>
                        <div>
                          <span className="font-medium">Teacher:</span>{' '}
                          {planDetails.teacherName}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span>
                          <span
                            className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(planDetails.status)}`}
                          >
                            {planDetails.status.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Progress:</span>{' '}
                          {planDetails.completedLessons}/
                          {planDetails.totalLessons} lessons
                        </div>
                      </div>
                    </div>

                    {/* Lessons List */}
                    <div>
                      <h4 className="font-semibold mb-3">
                        Lessons ({planDetails.lessons?.length || 0})
                      </h4>
                      <div className="space-y-2">
                        {planDetails.lessons?.map((lesson, index) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium">
                                {index + 1}.
                              </span>
                              <div>
                                <div className="font-medium">
                                  {lesson.title}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {lesson.date || 'Not scheduled'}
                                </div>
                              </div>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs ${getStatusColor(lesson.status)}`}
                            >
                              {lesson.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Approval Actions */}
                    {planDetails.status === 'submitted' && (
                      <div className="bg-yellow-50 p-4 rounded-md">
                        <h4 className="font-semibold mb-3">Approval Actions</h4>
                        <div className="flex gap-4">
                          <Button
                            onClick={() => {
                              handleApproval(planDetails.id, 'approved')
                              setSelectedPlan(null)
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                          >
                            Approve Plan
                          </Button>
                          <Button
                            onClick={() => {
                              const comments = prompt(
                                'Enter rejection comments:',
                              )
                              if (comments) {
                                handleApproval(
                                  planDetails.id,
                                  'rejected',
                                  comments,
                                )
                                setSelectedPlan(null)
                              }
                            }}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                          >
                            Reject Plan
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageLessonPlan
