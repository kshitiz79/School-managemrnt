import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lessonPlanApi } from '../../lib/api/lessonPlan'
import Button from '../../components/Button'

const CopyOldLessons = () => {
  const [sourceFilters, setSourceFilters] = useState({
    academicYear: new Date().getFullYear() - 1,
    subject: 'all',
    class: 'all',
    teacher: 'all',
  })
  const [targetFilters, setTargetFilters] = useState({
    academicYear: new Date().getFullYear(),
    subject: '',
    class: '',
    teacher: '',
  })
  const [selectedLessons, setSelectedLessons] = useState([])
  const [copyOptions, setCopyOptions] = useState({
    copyContent: true,
    copyAttachments: false,
    updateDates: true,
    preserveStatus: false,
    adjustSchedule: true,
  })

  const queryClient = useQueryClient()

  const { data: sourceLessons = [], isLoading: isLoadingSource } = useQuery({
    queryKey: ['oldLessons', sourceFilters],
    queryFn: () => lessonPlanApi.getOldLessons(sourceFilters),
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

  const copyLessonsMutation = useMutation({
    mutationFn: ({ lessons, target, options }) =>
      lessonPlanApi.copyLessons(lessons, target, options),
    onSuccess: result => {
      queryClient.invalidateQueries(['lessons'])
      alert(`Successfully copied ${result.copiedCount} lessons!`)
      setSelectedLessons([])
    },
    onError: error => {
      alert(`Failed to copy lessons: ${error.message}`)
    },
  })

  const previewCopyMutation = useMutation({
    mutationFn: ({ lessons, target, options }) =>
      lessonPlanApi.previewCopy(lessons, target, options),
  })

  const handleSourceFilterChange = e => {
    const { name, value } = e.target
    setSourceFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleTargetFilterChange = e => {
    const { name, value } = e.target
    setTargetFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleLessonSelect = lessonId => {
    setSelectedLessons(prev =>
      prev.includes(lessonId)
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    )
  }

  const handleSelectAll = () => {
    if (selectedLessons.length === sourceLessons.length) {
      setSelectedLessons([])
    } else {
      setSelectedLessons(
        Array.isArray(sourceLessons)
          ? sourceLessons.map(lesson => lesson.id)
          : [],
      )
    }
  }

  const handleCopyOptionsChange = e => {
    const { name, checked } = e.target
    setCopyOptions(prev => ({ ...prev, [name]: checked }))
  }

  const handlePreviewCopy = () => {
    if (selectedLessons.length === 0) {
      alert('Please select lessons to copy')
      return
    }
    if (!targetFilters.subject || !targetFilters.class) {
      alert('Please select target subject and class')
      return
    }

    previewCopyMutation.mutate({
      lessons: selectedLessons,
      target: targetFilters,
      options: copyOptions,
    })
  }

  const handleCopyLessons = () => {
    if (selectedLessons.length === 0) {
      alert('Please select lessons to copy')
      return
    }
    if (!targetFilters.subject || !targetFilters.class) {
      alert('Please select target subject and class')
      return
    }

    const confirmMessage = `Are you sure you want to copy ${selectedLessons.length} lesson(s) to ${targetFilters.academicYear}?`
    if (window.confirm(confirmMessage)) {
      copyLessonsMutation.mutate({
        lessons: selectedLessons,
        target: targetFilters,
        options: copyOptions,
      })
    }
  }

  const getStatusColor = status => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'planned':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const groupLessonsBySubject = () => {
    const grouped = {}
    sourceLessons.forEach(lesson => {
      const key = `${lesson.subjectName} - ${lesson.className}`
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(lesson)
    })
    return grouped
  }

  const groupedLessons = groupLessonsBySubject()

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📋</span>
          <h2 className="text-2xl font-bold">Copy Old Lessons</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Source Selection */}
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-4">
                📚 Source (Copy From)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Academic Year
                  </label>
                  <select
                    name="academicYear"
                    value={sourceFilters.academicYear}
                    onChange={handleSourceFilterChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value={new Date().getFullYear() - 2}>
                      {new Date().getFullYear() - 2}
                    </option>
                    <option value={new Date().getFullYear() - 1}>
                      {new Date().getFullYear() - 1}
                    </option>
                    <option value={new Date().getFullYear()}>
                      {new Date().getFullYear()}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subject
                  </label>
                  <select
                    name="subject"
                    value={sourceFilters.subject}
                    onChange={handleSourceFilterChange}
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
                  <label className="block text-sm font-medium mb-2">
                    Class
                  </label>
                  <select
                    name="class"
                    value={sourceFilters.class}
                    onChange={handleSourceFilterChange}
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
                  <label className="block text-sm font-medium mb-2">
                    Teacher
                  </label>
                  <select
                    name="teacher"
                    value={sourceFilters.teacher}
                    onChange={handleSourceFilterChange}
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
              </div>
            </div>

            {/* Source Lessons List */}
            <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">
                  Available Lessons ({sourceLessons.length})
                </h4>
                <Button
                  onClick={handleSelectAll}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  {selectedLessons.length === sourceLessons.length
                    ? 'Deselect All'
                    : 'Select All'}
                </Button>
              </div>

              {isLoadingSource ? (
                <div className="text-center py-4">Loading lessons...</div>
              ) : Object.keys(groupedLessons).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📚</div>
                  <div>No lessons found for the selected criteria</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(Object.entries(groupedLessons)) &&
                    Object.entries(groupedLessons).map(
                      ([subjectClass, lessons]) => (
                        <div
                          key={subjectClass}
                          className="bg-white p-3 rounded border"
                        >
                          <h5 className="font-medium mb-2 text-blue-700">
                            {subjectClass}
                          </h5>
                          <div className="space-y-2">
                            {Array.isArray(lessons) &&
                              lessons.map(lesson => (
                                <div
                                  key={lesson.id}
                                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedLessons.includes(
                                      lesson.id,
                                    )}
                                    onChange={() =>
                                      handleLessonSelect(lesson.id)
                                    }
                                    className="rounded"
                                  />
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">
                                      {lesson.title}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {lesson.date} • {lesson.duration || 'N/A'}{' '}
                                      min
                                    </div>
                                  </div>
                                  <span
                                    className={`px-2 py-1 rounded text-xs ${getStatusColor(lesson.status)}`}
                                  >
                                    {lesson.status.toUpperCase()}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      ),
                    )}
                </div>
              )}
            </div>
          </div>

          {/* Target Selection & Options */}
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-4">
                🎯 Target (Copy To)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Academic Year
                  </label>
                  <select
                    name="academicYear"
                    value={targetFilters.academicYear}
                    onChange={handleTargetFilterChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value={new Date().getFullYear()}>
                      {new Date().getFullYear()}
                    </option>
                    <option value={new Date().getFullYear() + 1}>
                      {new Date().getFullYear() + 1}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={targetFilters.subject}
                    onChange={handleTargetFilterChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select Subject</option>
                    {Array.isArray(subjects) &&
                      subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Class *
                  </label>
                  <select
                    name="class"
                    value={targetFilters.class}
                    onChange={handleTargetFilterChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select Class</option>
                    {Array.isArray(classes) &&
                      classes.map(cls => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Assign to Teacher
                  </label>
                  <select
                    name="teacher"
                    value={targetFilters.teacher}
                    onChange={handleTargetFilterChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Keep Original Teacher</option>
                    {Array.isArray(teachers) &&
                      teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Copy Options */}
            <div className="bg-yellow-50 p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-4">⚙️ Copy Options</h3>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="copyContent"
                    name="copyContent"
                    checked={copyOptions.copyContent}
                    onChange={handleCopyOptionsChange}
                    className="mr-2"
                  />
                  <label htmlFor="copyContent" className="text-sm font-medium">
                    Copy lesson content (objectives, activities, materials)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="copyAttachments"
                    name="copyAttachments"
                    checked={copyOptions.copyAttachments}
                    onChange={handleCopyOptionsChange}
                    className="mr-2"
                  />
                  <label
                    htmlFor="copyAttachments"
                    className="text-sm font-medium"
                  >
                    Copy attachments and files
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="updateDates"
                    name="updateDates"
                    checked={copyOptions.updateDates}
                    onChange={handleCopyOptionsChange}
                    className="mr-2"
                  />
                  <label htmlFor="updateDates" className="text-sm font-medium">
                    Update dates to current academic year
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="preserveStatus"
                    name="preserveStatus"
                    checked={copyOptions.preserveStatus}
                    onChange={handleCopyOptionsChange}
                    className="mr-2"
                  />
                  <label
                    htmlFor="preserveStatus"
                    className="text-sm font-medium"
                  >
                    Preserve lesson status (otherwise set to 'planned')
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="adjustSchedule"
                    name="adjustSchedule"
                    checked={copyOptions.adjustSchedule}
                    onChange={handleCopyOptionsChange}
                    className="mr-2"
                  />
                  <label
                    htmlFor="adjustSchedule"
                    className="text-sm font-medium"
                  >
                    Auto-adjust schedule based on academic calendar
                  </label>
                </div>
              </div>
            </div>

            {/* Preview Results */}
            {previewCopyMutation.data && (
              <div className="bg-purple-50 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-4">📋 Copy Preview</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Lessons to copy:</span>{' '}
                    {previewCopyMutation.data.totalLessons}
                  </div>
                  <div>
                    <span className="font-medium">Estimated duration:</span>{' '}
                    {previewCopyMutation.data.totalDuration} minutes
                  </div>
                  <div>
                    <span className="font-medium">Date range:</span>{' '}
                    {previewCopyMutation.data.dateRange}
                  </div>
                  <div>
                    <span className="font-medium">Conflicts detected:</span>{' '}
                    {previewCopyMutation.data.conflicts || 0}
                  </div>
                  {previewCopyMutation.data.warnings &&
                    previewCopyMutation.data.warnings.length > 0 && (
                      <div className="mt-3">
                        <div className="font-medium text-orange-700">
                          Warnings:
                        </div>
                        <ul className="list-disc list-inside text-orange-600">
                          {Array.isArray(previewCopyMutation.data.warnings) &&
                            previewCopyMutation.data.warnings.map(
                              (warning, index) => <li key={index}>{warning}</li>,
                            )}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handlePreviewCopy}
                disabled={
                  previewCopyMutation.isPending || selectedLessons.length === 0
                }
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
              >
                {previewCopyMutation.isPending
                  ? 'Previewing...'
                  : 'Preview Copy'}
              </Button>

              <Button
                onClick={handleCopyLessons}
                disabled={
                  copyLessonsMutation.isPending || selectedLessons.length === 0
                }
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                {copyLessonsMutation.isPending
                  ? 'Copying...'
                  : `Copy ${selectedLessons.length} Lesson(s)`}
              </Button>
            </div>

            {/* Selected Lessons Summary */}
            {selectedLessons.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-semibold mb-2">
                  Selected Lessons ({selectedLessons.length})
                </h4>
                <div className="max-h-32 overflow-y-auto">
                  {sourceLessons
                    .filter(lesson => selectedLessons.includes(lesson.id))
                    .map(lesson => (
                      <div
                        key={lesson.id}
                        className="text-sm py-1 flex justify-between"
                      >
                        <span>{lesson.title}</span>
                        <span className="text-gray-500">
                          {lesson.subjectName}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CopyOldLessons
