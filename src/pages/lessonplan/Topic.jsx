import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { lessonPlanApi } from '../../lib/api/lessonPlan'
import Button from '../../components/Button'

const Topic = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    class: '',
    chapter: '',
    estimatedHours: '',
    difficulty: 'medium',
    prerequisites: '',
    learningObjectives: '',
    isActive: true,
  })
  const [editingId, setEditingId] = useState(null)
  const [filters, setFilters] = useState({
    subject: 'all',
    class: 'all',
    difficulty: 'all',
  })

  const queryClient = useQueryClient()

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['topics', filters],
    queryFn: () => lessonPlanApi.getTopics(filters),
  })

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: lessonPlanApi.getSubjects,
  })

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: lessonPlanApi.getClasses,
  })

  const addTopicMutation = useMutation({
    mutationFn: lessonPlanApi.addTopic,
    onSuccess: () => {
      queryClient.invalidateQueries(['topics'])
      resetForm()
      alert('Topic added successfully!')
    },
  })

  const updateTopicMutation = useMutation({
    mutationFn: ({ id, data }) => lessonPlanApi.updateTopic(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['topics'])
      resetForm()
      alert('Topic updated successfully!')
    },
  })

  const deleteTopicMutation = useMutation({
    mutationFn: lessonPlanApi.deleteTopic,
    onSuccess: () => {
      queryClient.invalidateQueries(['topics'])
      alert('Topic deleted successfully!')
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      subject: '',
      class: '',
      chapter: '',
      estimatedHours: '',
      difficulty: 'medium',
      prerequisites: '',
      learningObjectives: '',
      isActive: true,
    })
    setEditingId(null)
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (editingId) {
      updateTopicMutation.mutate({ id: editingId, data: formData })
    } else {
      addTopicMutation.mutate(formData)
    }
  }

  const handleEdit = topic => {
    setFormData({
      name: topic.name,
      description: topic.description || '',
      subject: topic.subject,
      class: topic.class,
      chapter: topic.chapter || '',
      estimatedHours: topic.estimatedHours || '',
      difficulty: topic.difficulty,
      prerequisites: topic.prerequisites || '',
      learningObjectives: topic.learningObjectives || '',
      isActive: topic.isActive,
    })
    setEditingId(topic.id)
  }

  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      deleteTopicMutation.mutate(id)
    }
  }

  const handleFilterChange = e => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const getDifficultyColor = difficulty => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📖</span>
          <h2 className="text-2xl font-bold">Topic Management</h2>
        </div>

        {/* Add/Edit Form */}
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Topic' : 'Add New Topic'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Topic Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
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
                <label className="block text-sm font-medium mb-2">
                  Chapter
                </label>
                <input
                  type="text"
                  value={formData.chapter}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, chapter: e.target.value }))
                  }
                  className="w-full p-2 border rounded-md"
                  placeholder="Chapter name or number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  value={formData.estimatedHours}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      estimatedHours: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                  min="0"
                  step="0.5"
                  placeholder="Hours needed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Difficulty Level
                </label>
                <select
                  value={formData.difficulty}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      difficulty: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded-md"
                rows="3"
                placeholder="Brief description of the topic"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Prerequisites
              </label>
              <textarea
                value={formData.prerequisites}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    prerequisites: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded-md"
                rows="2"
                placeholder="What students should know before this topic"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Learning Objectives
              </label>
              <textarea
                value={formData.learningObjectives}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    learningObjectives: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded-md"
                rows="3"
                placeholder="What students will learn from this topic"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={e =>
                  setFormData(prev => ({ ...prev, isActive: e.target.checked }))
                }
                className="mr-2"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Active Topic
              </label>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={
                  addTopicMutation.isPending || updateTopicMutation.isPending
                }
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                {editingId ? 'Update' : 'Add'} Topic
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Filter by Subject
            </label>
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
            <label className="block text-sm font-medium mb-2">
              Filter by Class
            </label>
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
            <label className="block text-sm font-medium mb-2">
              Filter by Difficulty
            </label>
            <select
              name="difficulty"
              value={filters.difficulty}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="all">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Topics List */}
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(topics) &&
              topics.map(topic => (
                <div
                  key={topic.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold">{topic.name}</h3>
                    <div className="flex gap-1">
                      <span
                        className={`px-2 py-1 rounded text-xs ${getDifficultyColor(topic.difficulty)}`}
                      >
                        {topic.difficulty.toUpperCase()}
                      </span>
                      {!topic.isActive && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                          INACTIVE
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Subject:</span>{' '}
                      {topic.subjectName}
                    </div>
                    <div>
                      <span className="font-medium">Class:</span>{' '}
                      {topic.className}
                    </div>
                    {topic.chapter && (
                      <div>
                        <span className="font-medium">Chapter:</span>{' '}
                        {topic.chapter}
                      </div>
                    )}
                    {topic.estimatedHours && (
                      <div>
                        <span className="font-medium">Duration:</span>{' '}
                        {topic.estimatedHours} hours
                      </div>
                    )}
                  </div>

                  {topic.description && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                      {topic.description}
                    </p>
                  )}

                  {topic.learningObjectives && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-600 mb-1">
                        Learning Objectives:
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {topic.learningObjectives}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t">
                    <div className="text-xs text-gray-500">
                      {topic.lessonCount || 0} lesson
                      {(topic.lessonCount || 0) !== 1 ? 's' : ''}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(topic)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(topic.id)}
                        disabled={deleteTopicMutation.isPending}
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

        {topics.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-6xl mb-4">📖</div>
            <div className="text-xl mb-2">No topics found</div>
            <div className="text-sm">
              Add topics to organize your lesson plans
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Topic
