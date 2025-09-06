import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { homeworkApi } from '../../lib/api/homework'
import Button from '../../components/Button'
import { exportToCSV, exportToPDF } from '../../lib/export'

const DailyAssignment = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  )
  const [filters, setFilters] = useState({
    class: 'all',
    subject: 'all',
    status: 'all',
  })
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [gradingMode, setGradingMode] = useState(false)

  const queryClient = useQueryClient()

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['dailyAssignments', selectedDate, filters],
    queryFn: () => homeworkApi.getDailyAssignments(selectedDate, filters),
  })

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: homeworkApi.getClasses,
  })

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: homeworkApi.getSubjects,
  })

  const { data: submissions = [], isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['submissions', selectedAssignment],
    queryFn: () => homeworkApi.getSubmissions(selectedAssignment),
    enabled: !!selectedAssignment,
  })

  const gradeSubmissionMutation = useMutation({
    mutationFn: ({ submissionId, grade, feedback }) =>
      homeworkApi.gradeSubmission(submissionId, grade, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries(['submissions'])
      alert('Grade submitted successfully!')
    },
  })

  const bulkGradeMutation = useMutation({
    mutationFn: homeworkApi.bulkGradeSubmissions,
    onSuccess: () => {
      queryClient.invalidateQueries(['submissions'])
      alert('Bulk grading completed!')
    },
  })

  const handleFilterChange = e => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleGradeSubmission = (submissionId, grade, feedback) => {
    gradeSubmissionMutation.mutate({ submissionId, grade, feedback })
  }

  const handleExportSubmissions = () => {
    const exportData = Array.isArray(submissions)
      ? submissions.map(sub => ({
          'Student Name': sub.studentName,
          'Roll Number': sub.rollNumber,
          'Submission Date': sub.submittedAt,
          Status: sub.status,
          Grade: sub.grade || 'Not Graded',
          Feedback: sub.feedback || '',
        }))
      : []
    exportToCSV(exportData, `submissions-${selectedAssignment}`)
  }

  const getStatusColor = status => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800'
      case 'late':
        return 'bg-orange-100 text-orange-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'graded':
        return 'bg-blue-100 text-blue-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-l-green-500 bg-green-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getSubmissionStats = assignment => {
    const total = assignment.totalStudents || 0
    const submitted = assignment.submittedCount || 0
    const graded = assignment.gradedCount || 0
    const pending = total - submitted

    return { total, submitted, graded, pending }
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📋</span>
            <h2 className="text-2xl font-bold">Daily Assignment Tracking</h2>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="p-2 border rounded-md"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="due_today">Due Today</option>
              <option value="overdue">Overdue</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={() => setGradingMode(!gradingMode)}
              className={`px-4 py-2 rounded-md ${
                gradingMode
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {gradingMode ? '✓ Grading Mode' : 'Enable Grading'}
            </Button>
          </div>
        </div>

        {/* Assignments List */}
        {isLoading ? (
          <div className="text-center py-8">Loading assignments...</div>
        ) : (
          <div className="space-y-4">
            {Array.isArray(assignments) &&
              assignments.map(assignment => {
                const stats = getSubmissionStats(assignment)
                const completionRate =
                  stats.total > 0
                    ? ((stats.submitted / stats.total) * 100).toFixed(1)
                    : 0

                return (
                  <div
                    key={assignment.id}
                    className={`border-l-4 rounded-lg p-4 ${getPriorityColor(assignment.priority)}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {assignment.title}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              assignment.priority === 'high'
                                ? 'bg-red-100 text-red-800'
                                : assignment.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {assignment.priority.toUpperCase()}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${getStatusColor(assignment.status)}`}
                          >
                            {assignment.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                          <div>
                            <span className="font-medium">Subject:</span>{' '}
                            {assignment.subjectName}
                          </div>
                          <div>
                            <span className="font-medium">Class:</span>{' '}
                            {assignment.className}
                          </div>
                          <div>
                            <span className="font-medium">Due:</span>{' '}
                            {assignment.dueDate}
                          </div>
                          <div>
                            <span className="font-medium">Max Marks:</span>{' '}
                            {assignment.maxMarks || 'N/A'}
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-3">
                          {assignment.description}
                        </p>
                      </div>
                    </div>

                    {/* Submission Statistics */}
                    <div className="bg-white p-3 rounded border mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Submission Progress</h4>
                        <span className="text-sm font-medium">
                          {completionRate}% Complete
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${completionRate}%` }}
                        ></div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-center text-sm">
                        <div>
                          <div className="font-bold text-lg text-gray-700">
                            {stats.total}
                          </div>
                          <div className="text-gray-600">Total</div>
                        </div>
                        <div>
                          <div className="font-bold text-lg text-green-600">
                            {stats.submitted}
                          </div>
                          <div className="text-gray-600">Submitted</div>
                        </div>
                        <div>
                          <div className="font-bold text-lg text-blue-600">
                            {stats.graded}
                          </div>
                          <div className="text-gray-600">Graded</div>
                        </div>
                        <div>
                          <div className="font-bold text-lg text-orange-600">
                            {stats.pending}
                          </div>
                          <div className="text-gray-600">Pending</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={() => setSelectedAssignment(assignment.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        View Submissions ({stats.submitted})
                      </Button>

                      {gradingMode && stats.submitted > 0 && (
                        <Button
                          onClick={() => setSelectedAssignment(assignment.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Grade Submissions
                        </Button>
                      )}

                      <Button
                        onClick={() =>
                          window.open(
                            `/homework/assignment/${assignment.id}`,
                            '_blank',
                          )
                        }
                        className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                )
              })}
          </div>
        )}

        {assignments.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-6xl mb-4">📚</div>
            <div className="text-xl mb-2">No assignments found</div>
            <div className="text-sm">
              No assignments are due for the selected date and filters
            </div>
          </div>
        )}

        {/* Submissions Modal */}
        {selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Assignment Submissions
                </h3>
                <div className="flex gap-2">
                  <Button
                    onClick={handleExportSubmissions}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Export CSV
                  </Button>
                  <Button
                    onClick={() => setSelectedAssignment(null)}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                  >
                    Close
                  </Button>
                </div>
              </div>

              {isLoadingSubmissions ? (
                <div className="text-center py-4">Loading submissions...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Student
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Roll No.
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-center">
                          Status
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-center">
                          Submitted At
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-center">
                          Attachments
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-center">
                          Grade
                        </th>
                        {gradingMode && (
                          <th className="border border-gray-300 px-4 py-2 text-center">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(submissions) &&
                        submissions.map(submission => (
                          <tr key={submission.id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">
                              <div>
                                <div className="font-medium">
                                  {submission.studentName}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {submission.className}
                                </div>
                              </div>
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {submission.rollNumber}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              <span
                                className={`px-2 py-1 rounded text-xs ${getStatusColor(submission.status)}`}
                              >
                                {submission.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                              {submission.submittedAt
                                ? new Date(
                                    submission.submittedAt,
                                  ).toLocaleString()
                                : '-'}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {submission.attachments &&
                              submission.attachments.length > 0 ? (
                                <div className="space-y-1">
                                  {Array.isArray(submission.attachments) &&
                                    submission.attachments.map(
                                      (file, index) => (
                                        <a
                                          key={index}
                                          href={file.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline text-xs block"
                                        >
                                          📎 {file.name}
                                        </a>
                                      ),
                                    )}
                                </div>
                              ) : (
                                <span className="text-gray-400">No files</span>
                              )}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {submission.grade ? (
                                <div>
                                  <div className="font-bold text-lg">
                                    {submission.grade}
                                  </div>
                                  {submission.maxMarks && (
                                    <div className="text-xs text-gray-600">
                                      / {submission.maxMarks}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">
                                  Not graded
                                </span>
                              )}
                            </td>
                            {gradingMode && (
                              <td className="border border-gray-300 px-4 py-2 text-center">
                                {submission.status === 'submitted' ||
                                submission.status === 'late' ? (
                                  <GradingForm
                                    submission={submission}
                                    onGrade={handleGradeSubmission}
                                    isLoading={
                                      gradeSubmissionMutation.isPending
                                    }
                                  />
                                ) : (
                                  <span className="text-gray-400">N/A</span>
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {submissions.length === 0 && !isLoadingSubmissions && (
                <div className="text-center py-8 text-gray-500">
                  No submissions found for this assignment.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Grading Form Component
const GradingForm = ({ submission, onGrade, isLoading }) => {
  const [grade, setGrade] = useState(submission.grade || '')
  const [feedback, setFeedback] = useState(submission.feedback || '')
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = e => {
    e.preventDefault()
    onGrade(submission.id, grade, feedback)
    setShowForm(false)
  }

  if (!showForm) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
      >
        Grade
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="number"
        value={grade}
        onChange={e => setGrade(e.target.value)}
        placeholder="Grade"
        className="w-16 p-1 border rounded text-xs"
        min="0"
        max={submission.maxMarks || 100}
        required
      />
      <textarea
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
        placeholder="Feedback"
        className="w-full p-1 border rounded text-xs"
        rows="2"
      />
      <div className="flex gap-1">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
        >
          Save
        </Button>
        <Button
          type="button"
          onClick={() => setShowForm(false)}
          className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default DailyAssignment
