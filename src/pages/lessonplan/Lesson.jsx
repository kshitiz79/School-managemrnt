import React, { useState, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { lessonPlanApi } from '../../lib/api/lessonPlan'
import Button from '../../components/Button'

const Lesson = () => {
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    subject: '',
    class: '',
    duration: '',
    date: '',
    objectives: '',
    materials: '',
    activities: '',
    assessment: '',
    homework: '',
    notes: '',
    status: 'planned',
  })
  const [editingId, setEditingId] = useState(null)
  const [filters, setFilters] = useState({
    subject: 'all',
    class: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
  })

  const queryClient = useQueryClient()

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['lessons', filters],
    queryFn: () => lessonPlanApi.getLessons(filters),
  })

  const { data: topicsResponse } = useQuery({
    queryKey: ['topics'],
    queryFn: lessonPlanApi.getTopics,
  })

  // Safely extract topics from API response
  const topics = useMemo(() => {
    if (Array.isArray(topicsResponse)) {
      return topicsResponse
    }
    if (topicsResponse?.data && Array.isArray(topicsResponse.data)) {
      return topicsResponse.data
    }
    return []
  }, [topicsResponse])

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: lessonPlanApi.getSubjects,
  })

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: lessonPlanApi.getClasses,
  })

  const addLessonMutation = useMutation({
    mutationFn: lessonPlanApi.addLesson,
    onSuccess: () => {
      queryClient.invalidateQueries(['lessons'])
      resetForm()
      alert('Lesson added successfully!')
    },
  })

  const updateLessonMutation = useMutation({
    mutationFn: ({ id, data }) => lessonPlanApi.updateLesson(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['lessons'])
      resetForm()
      alert('Lesson updated successfully!')
    },
  })

  const deleteLessonMutation = useMutation({
    mutationFn: lessonPlanApi.deleteLesson,
    onSuccess: () => {
      queryClient.invalidateQueries(['lessons'])
      alert('Lesson deleted successfully!')
    },
  })

  const duplicateLessonMutation = useMutation({
    mutationFn: lessonPlanApi.duplicateLesson,
    onSuccess: () => {
      queryClient.invalidateQueries(['lessons'])
      alert('Lesson duplicated successfully!')
    },
  })

  const resetForm = () => {
    setFormData({
      title: '',
      topic: '',
      subject: '',
      class: '',
      duration: '',
      date: '',
      objectives: '',
      materials: '',
      activities: '',
      assessment: '',
      homework: '',
      notes: '',
      status: 'planned',
    })
    setEditingId(null)
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (editingId) {
      updateLessonMutation.mutate({ id: editingId, data: formData })
    } else {
      addLessonMutation.mutate(formData)
    }
  }

  const handleEdit = lesson => {
    setFormData({
      title: lesson.title,
      topic: lesson.topic,
      subject: lesson.subject,
      class: lesson.class,
      duration: lesson.duration || '',
      date: lesson.date || '',
      objectives: lesson.objectives || '',
      materials: lesson.materials || '',
      activities: lesson.activities || '',
      assessment: lesson.assessment || '',
      homework: lesson.homework || '',
      notes: lesson.notes || '',
      status: lesson.status,
    })
    setEditingId(lesson.id)
  }

  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      deleteLessonMutation.mutate(id)
    }
  }

  const handleDuplicate = id => {
    duplicateLessonMutation.mutate(id)
  }

  const handleFilterChange = e => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const getStatusColor = status => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const printLesson = lesson => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Lesson Plan - ${lesson.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .section { margin-bottom: 15px; }
            .section-title { font-weight: bold; color: #333; margin-bottom: 5px; }
            .content { margin-left: 10px; }
            .meta-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .meta-item { flex: 1; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Lesson Plan</h1>
            <h2>${lesson.title}</h2>
          </div>
          
          <div class="meta-info">
            <div class="meta-item"><strong>Subject:</strong> ${lesson.subjectName}</div>
            <div class="meta-item"><strong>Class:</strong> ${lesson.className}</div>
            <div class="meta-item"><strong>Date:</strong> ${lesson.date || 'Not scheduled'}</div>
            <div class="meta-item"><strong>Duration:</strong> ${lesson.duration || 'Not specified'} minutes</div>
          </div>

          ${
            lesson.objectives
              ? `
            <div class="section">
              <div class="section-title">Learning Objectives:</div>
              <div class="content">${lesson.objectives.replace(/\n/g, '<br>')}</div>
            </div>
          `
              : ''
          }

          ${
            lesson.materials
              ? `
            <div class="section">
              <div class="section-title">Materials Required:</div>
              <div class="content">${lesson.materials.replace(/\n/g, '<br>')}</div>
            </div>
          `
              : ''
          }

          ${
            lesson.activities
              ? `
            <div class="section">
              <div class="section-title">Activities:</div>
              <div class="content">${lesson.activities.replace(/\n/g, '<br>')}</div>
            </div>
          `
              : ''
          }

          ${
            lesson.assessment
              ? `
            <div class="section">
              <div class="section-title">Assessment:</div>
              <div class="content">${lesson.assessment.replace(/\n/g, '<br>')}</div>
            </div>
          `
              : ''
          }

          ${
            lesson.homework
              ? `
            <div class="section">
              <div class="section-title">Homework:</div>
              <div class="content">${lesson.homework.replace(/\n/g, '<br>')}</div>
            </div>
          `
              : ''
          }

          ${
            lesson.notes
              ? `
            <div class="section">
              <div class="section-title">Notes:</div>
              <div class="content">${lesson.notes.replace(/\n/g, '<br>')}</div>
            </div>
          `
              : ''
          }
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📝</span>
          <h2 className="text-2xl font-bold">Lesson Management</h2>
        </div>

        {/* Add/Edit Form */}
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Lesson' : 'Add New Lesson'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Subject *
                </label>
                <select
                  value={formData.subject}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, subject: e.target.value }))
                  }
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
                  value={formData.class}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, class: e.target.value }))
                  }
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
                <label className="block text-sm font-medium mb-2">Topic</label>
                <select
                  value={formData.topic}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, topic: e.target.value }))
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Topic</option>
                  {Array.isArray(topics) &&
                    topics
                      .filter(
                        topic =>
                          !formData.subject || topic.subject === formData.subject
                      )
                      .map(topic => (
                        <option key={topic.id} value={topic.id}>
                          {topic.name}
                        </option>
                      ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, duration: e.target.value }))
                  }
                  className="w-full p-2 border rounded-md"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Learning Objectives
                </label>
                <textarea
                  value={formData.objectives}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      objectives: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                  rows="3"
                  placeholder="What will students learn?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Materials Required
                </label>
                <textarea
                  value={formData.materials}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      materials: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                  rows="3"
                  placeholder="Books, equipment, resources needed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Activities
                </label>
                <textarea
                  value={formData.activities}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      activities: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                  rows="4"
                  placeholder="Detailed lesson activities and timeline"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Assessment
                </label>
                <textarea
                  value={formData.assessment}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      assessment: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                  rows="4"
                  placeholder="How will you assess student understanding?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Homework
                </label>
                <textarea
                  value={formData.homework}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, homework: e.target.value }))
                  }
                  className="w-full p-2 border rounded-md"
                  rows="3"
                  placeholder="Homework assignments"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, notes: e.target.value }))
                  }
                  className="w-full p-2 border rounded-md"
                  rows="3"
                  placeholder="Additional notes or reflections"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={
                  addLessonMutation.isPending || updateLessonMutation.isPending
                }
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                {editingId ? 'Update' : 'Add'} Lesson
              </Button>
              <Button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </Button>
            </div>
          </form>
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
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">From Date</label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">To Date</label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        {/* Lessons List */}
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="space-y-4">
            {Array.isArray(lessons) &&
              lessons.map(lesson => (
                <div
                  key={lesson.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {lesson.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-xs ${getStatusColor(lesson.status)}`}
                        >
                          {lesson.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Subject:</span>{' '}
                          {lesson.subjectName}
                        </div>
                        <div>
                          <span className="font-medium">Class:</span>{' '}
                          {lesson.className}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span>{' '}
                          {lesson.date || 'Not scheduled'}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span>{' '}
                          {lesson.duration || 'Not specified'} min
                        </div>
                      </div>
                    </div>
                  </div>

                  {lesson.objectives && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        Objectives:
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {lesson.objectives}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t">
                    <div className="text-xs text-gray-500">
                      Created: {new Date(lesson.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => printLesson(lesson)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Print
                      </Button>
                      <Button
                        onClick={() => handleDuplicate(lesson.id)}
                        disabled={duplicateLessonMutation.isPending}
                        className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                      >
                        Duplicate
                      </Button>
                      <Button
                        onClick={() => handleEdit(lesson)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(lesson.id)}
                        disabled={deleteLessonMutation.isPending}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {lessons.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-6xl mb-4">📝</div>
            <div className="text-xl mb-2">No lessons found</div>
            <div className="text-sm">
              Create your first lesson plan to get started
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Lesson
