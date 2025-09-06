import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { homeworkApi } from '../../lib/api/homework'
import Button from '../../components/Button'

const AddHomework = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    class: '',
    section: '',
    assignedDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    priority: 'medium',
    type: 'assignment',
    attachments: [],
    instructions: '',
    maxMarks: '',
    submissionType: 'file',
    allowLateSubmission: true,
    notifyParents: true,
  })

  const queryClient = useQueryClient()

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: homeworkApi.getSubjects,
  })

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: homeworkApi.getClasses,
  })

  const addHomeworkMutation = useMutation({
    mutationFn: homeworkApi.addHomework,
    onSuccess: () => {
      queryClient.invalidateQueries(['homework'])
      resetForm()
      alert('Homework assigned successfully!')
    },
    onError: error => {
      alert(`Failed to assign homework: ${error.message}`)
    },
  })

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subject: '',
      class: '',
      section: '',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      priority: 'medium',
      type: 'assignment',
      attachments: [],
      instructions: '',
      maxMarks: '',
      submissionType: 'file',
      allowLateSubmission: true,
      notifyParents: true,
    })
  }

  const handleSubmit = e => {
    e.preventDefault()
    const submitData = new FormData()

    Object.keys(formData).forEach(key => {
      if (key === 'attachments') {
        formData.attachments.forEach(file => {
          submitData.append('attachments', file)
        })
      } else {
        submitData.append(key, formData[key])
      }
    })

    addHomeworkMutation.mutate(submitData)
  }

  const handleFileChange = e => {
    const files = Array.from(e.target.files)
    setFormData(prev => ({ ...prev, attachments: files }))
  }

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return 'border-red-300 bg-red-50'
      case 'medium':
        return 'border-yellow-300 bg-yellow-50'
      case 'low':
        return 'border-green-300 bg-green-50'
      default:
        return 'border-gray-300 bg-gray-50'
    }
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📚</span>
          <h2 className="text-2xl font-bold">Add Homework Assignment</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div
            className={`p-4 rounded-md border-2 ${getPriorityColor(formData.priority)}`}
          >
            <h3 className="text-lg font-semibold mb-4">Assignment Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  required
                  placeholder="Enter assignment title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Subject *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
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
                  value={formData.class}
                  onChange={handleChange}
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
                  Section
                </label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">All Sections</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Assignment Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="assignment">Assignment</option>
                  <option value="project">Project</option>
                  <option value="reading">Reading</option>
                  <option value="practice">Practice</option>
                  <option value="research">Research</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Assigned Date
                </label>
                <input
                  type="date"
                  name="assignedDate"
                  value={formData.assignedDate}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Maximum Marks
                </label>
                <input
                  type="number"
                  name="maxMarks"
                  value={formData.maxMarks}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  placeholder="Enter max marks"
                />
              </div>
            </div>
          </div>

          {/* Description and Instructions */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-4">
              Description & Instructions
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  rows="3"
                  required
                  placeholder="Brief description of the assignment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Detailed Instructions
                </label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  rows="5"
                  placeholder="Detailed instructions for students on how to complete the assignment"
                />
              </div>
            </div>
          </div>

          {/* Submission Settings */}
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-4">Submission Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Submission Type
                </label>
                <select
                  name="submissionType"
                  value={formData.submissionType}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="file">File Upload</option>
                  <option value="text">Text Submission</option>
                  <option value="both">File + Text</option>
                  <option value="offline">Offline Submission</option>
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowLateSubmission"
                    name="allowLateSubmission"
                    checked={formData.allowLateSubmission}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label
                    htmlFor="allowLateSubmission"
                    className="text-sm font-medium"
                  >
                    Allow Late Submission
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifyParents"
                    name="notifyParents"
                    checked={formData.notifyParents}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label
                    htmlFor="notifyParents"
                    className="text-sm font-medium"
                  >
                    Notify Parents
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-green-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-4">Attachments</h3>

            <div>
              <label className="block text-sm font-medium mb-2">
                Upload Files (Optional)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full p-2 border rounded-md"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
              />
              <div className="text-xs text-gray-600 mt-1">
                Supported formats: PDF, DOC, DOCX, PPT, PPTX, JPG, PNG, TXT
              </div>

              {formData.attachments.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm font-medium mb-2">
                    Selected Files:
                  </div>
                  <div className="space-y-1">
                    {Array.isArray(formData.attachments) &&
                      formData.attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm bg-white p-2 rounded border"
                        >
                          <span>📎</span>
                          <span>{file.name}</span>
                          <span className="text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          {formData.title && (
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-4">Assignment Preview</h3>
              <div className="bg-white p-4 rounded border">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-xl font-bold">{formData.title}</h4>
                  <span
                    className={`px-3 py-1 rounded text-sm ${
                      formData.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : formData.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {formData.priority.toUpperCase()} PRIORITY
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <span className="font-medium">Subject:</span>{' '}
                    {formData.subject}
                  </div>
                  <div>
                    <span className="font-medium">Class:</span> {formData.class}
                  </div>
                  <div>
                    <span className="font-medium">Due:</span> {formData.dueDate}
                  </div>
                  <div>
                    <span className="font-medium">Max Marks:</span>{' '}
                    {formData.maxMarks || 'N/A'}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="font-medium text-sm mb-1">Description:</div>
                  <div className="text-sm text-gray-700">
                    {formData.description}
                  </div>
                </div>

                {formData.instructions && (
                  <div className="mb-3">
                    <div className="font-medium text-sm mb-1">
                      Instructions:
                    </div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {formData.instructions}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 text-xs text-gray-600">
                  <span>📁 Submission: {formData.submissionType}</span>
                  {formData.allowLateSubmission && (
                    <span>⏰ Late submission allowed</span>
                  )}
                  {formData.notifyParents && (
                    <span>📧 Parents will be notified</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={addHomeworkMutation.isPending}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              {addHomeworkMutation.isPending
                ? 'Assigning...'
                : 'Assign Homework'}
            </Button>
            <Button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
            >
              Reset Form
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddHomework
