import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lessonPlanApi } from '../../lib/api/lessonPlan'
import Button from '../../components/Button'
import { exportToCSV, exportToPDF } from '../../lib/export'

const ManageSyllabusStatus = () => {
  const [filters, setFilters] = useState({
    subject: 'all',
    class: 'all',
    teacher: 'all',
    academicYear: new Date().getFullYear(),
  })
  const [selectedSyllabus, setSelectedSyllabus] = useState(null)

  const queryClient = useQueryClient()

  const { data: syllabusData = [], isLoading } = useQuery({
    queryKey: ['syllabusStatus', filters],
    queryFn: () => lessonPlanApi.getSyllabusStatus(filters),
  })

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

  const updateSyllabusStatusMutation = useMutation({
    mutationFn: ({ id, status, completionDate, notes }) =>
      lessonPlanApi.updateSyllabusStatus(id, status, completionDate, notes),
    onSuccess: () => {
      queryClient.invalidateQueries(['syllabusStatus'])
      alert('Syllabus status updated successfully!')
    },
  })

  const handleFilterChange = e => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleStatusUpdate = (
    id,
    status,
    completionDate = null,
    notes = '',
  ) => {
    updateSyllabusStatusMutation.mutate({ id, status, completionDate, notes })
  }

  const handleExport = () => {
    const exportData = Array.isArray(syllabusData)
      ? syllabusData.map(item => ({
          Subject: item.subjectName,
          Class: item.className,
          Teacher: item.teacherName,
          'Total Topics': item.totalTopics,
          'Completed Topics': item.completedTopics,
          'Progress %': item.progressPercentage,
          Status: item.status,
          'Expected Completion': item.expectedCompletion,
          'Actual Completion': item.actualCompletion || 'Not completed',
        }))
      : []
    exportToCSV(exportData, 'syllabus-status')
  }

  const getStatusColor = status => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 text-gray-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'on_track':
        return 'bg-green-100 text-green-800'
      case 'behind_schedule':
        return 'bg-orange-100 text-orange-800'
      case 'completed':
        return 'bg-purple-100 text-purple-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressColor = percentage => {
    if (percentage >= 90) return 'bg-green-500'
    if (percentage >= 75) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    if (percentage >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const calculateOverallProgress = () => {
    const data = Array.isArray(syllabusData) ? syllabusData : []
    if (data.length === 0) return 0
    const totalProgress = data.reduce(
      (sum, item) => sum + item.progressPercentage,
      0,
    )
    return (totalProgress / data.length).toFixed(1)
  }

  const getStatusCounts = () => {
    const data = Array.isArray(syllabusData) ? syllabusData : []
    return {
      not_started: data.filter(item => item.status === 'not_started').length,
      in_progress: data.filter(item => item.status === 'in_progress').length,
      on_track: data.filter(item => item.status === 'on_track').length,
      behind_schedule: data.filter(item => item.status === 'behind_schedule')
        .length,
      completed: data.filter(item => item.status === 'completed').length,
      overdue: data.filter(item => item.status === 'overdue').length,
    }
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <h2 className="text-2xl font-bold">Syllabus Status Management</h2>
          </div>

          <Button
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Export Report
          </Button>
        </div>

        {/* Overall Progress */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Overall Syllabus Progress</h3>
            <span className="text-2xl font-bold text-blue-600">
              {calculateOverallProgress()}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${calculateOverallProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* Status Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-700">
              {statusCounts.not_started}
            </div>
            <div className="text-sm text-gray-600">Not Started</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-700">
              {statusCounts.in_progress}
            </div>
            <div className="text-sm text-blue-600">In Progress</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-700">
              {statusCounts.on_track}
            </div>
            <div className="text-sm text-green-600">On Track</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-700">
              {statusCounts.behind_schedule}
            </div>
            <div className="text-sm text-orange-600">Behind</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-700">
              {statusCounts.completed}
            </div>
            <div className="text-sm text-purple-600">Completed</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-700">
              {statusCounts.overdue}
            </div>
            <div className="text-sm text-red-600">Overdue</div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

        {/* Syllabus Status Table */}
        {isLoading ? (
          <div className="text-center py-8">Loading syllabus data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Subject
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Class
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Teacher
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Progress
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Status
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Expected
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(syllabusData) &&
                  syllabusData.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="font-medium">{item.subjectName}</div>
                        <div className="text-sm text-gray-600">
                          {item.totalTopics} topics
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.className}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.teacherName}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span>
                                {item.completedTopics}/{item.totalTopics}
                              </span>
                              <span>{item.progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${getProgressColor(item.progressPercentage)}`}
                                style={{ width: `${item.progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs ${getStatusColor(item.status)}`}
                        >
                          {item.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                        <div>{item.expectedCompletion}</div>
                        {item.actualCompletion && (
                          <div className="text-green-600">
                            ✓ {item.actualCompletion}
                          </div>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <div className="flex gap-1 justify-center">
                          <Button
                            onClick={() => setSelectedSyllabus(item)}
                            className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                          >
                            View
                          </Button>
                          {item.status !== 'completed' && (
                            <Button
                              onClick={() =>
                                handleStatusUpdate(
                                  item.id,
                                  'completed',
                                  new Date().toISOString().split('T')[0],
                                )
                              }
                              className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {syllabusData.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-6xl mb-4">📊</div>
            <div className="text-xl mb-2">No syllabus data found</div>
            <div className="text-sm">No data matches the selected filters</div>
          </div>
        )}

        {/* Syllabus Details Modal */}
        {selectedSyllabus && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Syllabus Details - {selectedSyllabus.subjectName} (
                  {selectedSyllabus.className})
                </h3>
                <Button
                  onClick={() => setSelectedSyllabus(null)}
                  className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                >
                  Close
                </Button>
              </div>

              <div className="space-y-6">
                {/* Overview */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-semibold mb-3">Overview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Teacher:</span>{' '}
                      {selectedSyllabus.teacherName}
                    </div>
                    <div>
                      <span className="font-medium">Total Topics:</span>{' '}
                      {selectedSyllabus.totalTopics}
                    </div>
                    <div>
                      <span className="font-medium">Completed:</span>{' '}
                      {selectedSyllabus.completedTopics}
                    </div>
                    <div>
                      <span className="font-medium">Progress:</span>{' '}
                      {selectedSyllabus.progressPercentage}%
                    </div>
                    <div>
                      <span className="font-medium">Expected Completion:</span>{' '}
                      {selectedSyllabus.expectedCompletion}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedSyllabus.status)}`}
                      >
                        {selectedSyllabus.status
                          .replace('_', ' ')
                          .toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Topics Breakdown */}
                <div>
                  <h4 className="font-semibold mb-3">Topics Progress</h4>
                  <div className="space-y-2">
                    {selectedSyllabus.topics?.map((topic, index) => (
                      <div
                        key={topic.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">
                            {index + 1}.
                          </span>
                          <div>
                            <div className="font-medium">{topic.name}</div>
                            <div className="text-sm text-gray-600">
                              {topic.estimatedHours} hours • {topic.difficulty}{' '}
                              difficulty
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              topic.isCompleted
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {topic.isCompleted ? 'COMPLETED' : 'PENDING'}
                          </span>
                          {topic.completedDate && (
                            <span className="text-xs text-gray-500">
                              {topic.completedDate}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Update Actions */}
                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="font-semibold mb-3">Update Status</h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedSyllabus.status !== 'completed' && (
                      <Button
                        onClick={() => {
                          handleStatusUpdate(
                            selectedSyllabus.id,
                            'completed',
                            new Date().toISOString().split('T')[0],
                          )
                          setSelectedSyllabus(null)
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Mark as Completed
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        const notes = prompt('Enter status notes:')
                        if (notes) {
                          handleStatusUpdate(
                            selectedSyllabus.id,
                            'behind_schedule',
                            null,
                            notes,
                          )
                          setSelectedSyllabus(null)
                        }
                      }}
                      className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                    >
                      Mark Behind Schedule
                    </Button>
                    <Button
                      onClick={() => {
                        handleStatusUpdate(selectedSyllabus.id, 'on_track')
                        setSelectedSyllabus(null)
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Mark On Track
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageSyllabusStatus
