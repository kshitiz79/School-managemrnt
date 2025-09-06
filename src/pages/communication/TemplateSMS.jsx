import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { communicationApi } from '../../lib/api/communication'
import Button from '../../components/Button'

const TemplateSMS = () => {
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    category: 'general',
    variables: [],
    isActive: true,
  })
  const [editingId, setEditingId] = useState(null)
  const [previewData, setPreviewData] = useState({})

  const queryClient = useQueryClient()

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates', 'sms'],
    queryFn: () => communicationApi.getTemplates('sms'),
  })

  const addTemplateMutation = useMutation({
    mutationFn: data => communicationApi.addTemplate('sms', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['templates', 'sms'])
      resetForm()
      alert('SMS template added successfully!')
    },
  })

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      communicationApi.updateTemplate('sms', id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['templates', 'sms'])
      resetForm()
      alert('SMS template updated successfully!')
    },
  })

  const deleteTemplateMutation = useMutation({
    mutationFn: id => communicationApi.deleteTemplate('sms', id),
    onSuccess: () => {
      queryClient.invalidateQueries(['templates', 'sms'])
      alert('SMS template deleted successfully!')
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      content: '',
      category: 'general',
      variables: [],
      isActive: true,
    })
    setEditingId(null)
    setPreviewData({})
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (editingId) {
      updateTemplateMutation.mutate({ id: editingId, data: formData })
    } else {
      addTemplateMutation.mutate(formData)
    }
  }

  const handleEdit = template => {
    setFormData({
      name: template.name,
      content: template.content,
      category: template.category,
      variables: template.variables || [],
      isActive: template.isActive,
    })
    setEditingId(template.id)
  }

  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplateMutation.mutate(id)
    }
  }

  const extractVariables = content => {
    const matches = content.match(/\{\{([^}]+)\}\}/g)
    return matches ? matches.map(match => match.replace(/[{}]/g, '')) : []
  }

  const handleContentChange = content => {
    const variables = extractVariables(content)
    setFormData(prev => ({ ...prev, content, variables }))
  }

  const generatePreview = template => {
    let preview = template.content
    template.variables?.forEach(variable => {
      const value = previewData[variable] || `[${variable}]`
      preview = preview.replace(
        new RegExp(`\\{\\{${variable}\\}\\}`, 'g'),
        value,
      )
    })
    return preview
  }

  const predefinedTemplates = [
    {
      name: 'Fee Due Alert',
      content:
        'Fee due: Rs.{{amount}} for {{student_name}} ({{class}}). Due: {{due_date}}. Pay now to avoid late fees.',
      category: 'fees',
    },
    {
      name: 'Absent Alert',
      content:
        '{{student_name}} absent today ({{date}}). Contact school if unplanned absence.',
      category: 'attendance',
    },
    {
      name: 'Exam Reminder',
      content:
        '{{exam_name}} for {{student_name}} ({{class}}) on {{exam_date}}. Best wishes!',
      category: 'exams',
    },
    {
      name: 'Event Notice',
      content:
        '{{event_name}} on {{date}} at {{time}}. Your presence is requested.',
      category: 'events',
    },
    {
      name: 'Holiday Notice',
      content:
        'School closed on {{date}} for {{reason}}. Classes resume {{resume_date}}.',
      category: 'announcements',
    },
    {
      name: 'Result Published',
      content:
        '{{exam_name}} results for {{student_name}} are now available. Check school portal.',
      category: 'results',
    },
  ]

  const loadPredefinedTemplate = template => {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      content: template.content,
      category: template.category,
      variables: extractVariables(template.content),
    }))
  }

  const getCharacterCount = text => {
    const smsLength = text.length
    const smsCount = Math.ceil(smsLength / 160)
    return { length: smsLength, count: smsCount }
  }

  const charInfo = getCharacterCount(formData.content)

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">💬 SMS Templates</h2>

        {/* Quick Templates */}
        <div className="bg-purple-50 p-4 rounded-md mb-6">
          <h3 className="text-lg font-semibold mb-3">Quick Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {Array.isArray(predefinedTemplates) &&
              predefinedTemplates.map((template, index) => (
                <Button
                  key={index}
                  onClick={() => loadPredefinedTemplate(template)}
                  className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700"
                >
                  {template.name}
                </Button>
              ))}
          </div>
        </div>

        {/* Add/Edit Form */}
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Template' : 'Add New Template'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Template Name *
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
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, category: e.target.value }))
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="general">General</option>
                  <option value="fees">Fees</option>
                  <option value="attendance">Attendance</option>
                  <option value="exams">Exams</option>
                  <option value="events">Events</option>
                  <option value="announcements">Announcements</option>
                  <option value="results">Results</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Message Content *
                <span
                  className={`text-xs ml-2 ${charInfo.length > 160 ? 'text-orange-600' : 'text-gray-500'}`}
                >
                  ({charInfo.length}/160 chars, {charInfo.count} SMS
                  {charInfo.count > 1 ? 's' : ''})
                </span>
              </label>
              <textarea
                value={formData.content}
                onChange={e => handleContentChange(e.target.value)}
                className={`w-full p-2 border rounded-md ${charInfo.length > 160 ? 'border-orange-300' : ''}`}
                rows="4"
                required
                placeholder="Enter your SMS template. Keep it concise - SMS has 160 character limit per message."
              />
              <div className="text-xs text-gray-600 mt-1">
                Use double curly braces for variables:
                <span className="bg-gray-100 px-1 rounded font-mono">
                  {'{student_name}'}
                </span>
                ,
                <span className="bg-gray-100 px-1 rounded font-mono">
                  {'{parent_name}'}
                </span>
                ,
                <span className="bg-gray-100 px-1 rounded font-mono">
                  {'{amount}'}
                </span>
                , etc.
              </div>

              {charInfo.length > 160 && (
                <div className="text-xs text-orange-600 mt-1">
                  ⚠️ Message exceeds 160 characters and will be sent as{' '}
                  {charInfo.count} SMS messages.
                </div>
              )}
            </div>

            {/* Variables Display */}
            {formData.variables.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Detected Variables
                </label>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(formData.variables) &&
                    formData.variables.map((variable, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                      >
                        {`{${variable}}`}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Preview Section */}
            {formData.content && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Preview
                </label>
                <div className="bg-white border rounded-md p-3">
                  <div className="bg-purple-500 text-white p-2 rounded-t text-sm font-medium">
                    SMS Message Preview
                  </div>
                  <div className="p-3 border-l border-r border-b rounded-b bg-gray-50">
                    {formData.variables.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs text-gray-600 mb-2">
                          Fill sample data for preview:
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Array.isArray(formData.variables) &&
                            formData.variables.map((variable, index) => (
                              <input
                                key={index}
                                type="text"
                                placeholder={variable}
                                value={previewData[variable] || ''}
                                onChange={e =>
                                  setPreviewData(prev => ({
                                    ...prev,
                                    [variable]: e.target.value,
                                  }))
                                }
                                className="text-xs p-1 border rounded"
                              />
                            ))}
                        </div>
                      </div>
                    )}
                    <div className="text-sm font-mono bg-white p-2 rounded border">
                      {generatePreview(formData)}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Length: {generatePreview(formData).length} characters
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                Active Template
              </label>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={
                  addTemplateMutation.isPending ||
                  updateTemplateMutation.isPending
                }
                className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700"
              >
                {editingId ? 'Update' : 'Add'} Template
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

        {/* Templates List */}
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="space-y-4">
            {Array.isArray(templates) &&
              templates.map(template => {
                const templateCharInfo = getCharacterCount(template.content)
                return (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          {template.name}
                        </h3>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                          {template.category}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            templateCharInfo.length > 160
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {templateCharInfo.count} SMS
                        </span>
                        {!template.isActive && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(template)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(template.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded mb-2">
                      <div className="text-sm font-mono">
                        {template.content}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {templateCharInfo.length} characters
                      </div>
                    </div>

                    {template.variables && template.variables.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className="text-xs text-gray-600">
                          Variables:
                        </span>
                        {Array.isArray(template.variables) &&
                          template.variables.map((variable, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs"
                            >
                              {`{${variable}}`}
                            </span>
                          ))}
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Created: {template.createdAt} | Used:{' '}
                      {template.usageCount || 0} times
                    </div>
                  </div>
                )
              })}
          </div>
        )}

        {templates.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            No SMS templates found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  )
}

export default TemplateSMS
