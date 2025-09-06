import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { communicationApi } from '../../lib/api/communication'
import Button from '../../components/Button'

const TemplateEmail = () => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'general',
    variables: [],
    isActive: true,
    isHtml: false,
  })
  const [editingId, setEditingId] = useState(null)
  const [previewData, setPreviewData] = useState({})

  const queryClient = useQueryClient()

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates', 'email'],
    queryFn: () => communicationApi.getTemplates('email'),
  })

  const addTemplateMutation = useMutation({
    mutationFn: data => communicationApi.addTemplate('email', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['templates', 'email'])
      resetForm()
      alert('Email template added successfully!')
    },
  })

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      communicationApi.updateTemplate('email', id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['templates', 'email'])
      resetForm()
      alert('Email template updated successfully!')
    },
  })

  const deleteTemplateMutation = useMutation({
    mutationFn: id => communicationApi.deleteTemplate('email', id),
    onSuccess: () => {
      queryClient.invalidateQueries(['templates', 'email'])
      alert('Email template deleted successfully!')
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      content: '',
      category: 'general',
      variables: [],
      isActive: true,
      isHtml: false,
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
      subject: template.subject || '',
      content: template.content,
      category: template.category,
      variables: template.variables || [],
      isActive: template.isActive,
      isHtml: template.isHtml || false,
    })
    setEditingId(template.id)
  }

  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplateMutation.mutate(id)
    }
  }

  const extractVariables = text => {
    const matches = text.match(/\{\{([^}]+)\}\}/g)
    return matches ? matches.map(match => match.replace(/[{}]/g, '')) : []
  }

  const handleContentChange = content => {
    const subjectVars = extractVariables(formData.subject)
    const contentVars = extractVariables(content)
    const allVariables = [...new Set([...subjectVars, ...contentVars])]
    setFormData(prev => ({ ...prev, content, variables: allVariables }))
  }

  const handleSubjectChange = subject => {
    const subjectVars = extractVariables(subject)
    const contentVars = extractVariables(formData.content)
    const allVariables = [...new Set([...subjectVars, ...contentVars])]
    setFormData(prev => ({ ...prev, subject, variables: allVariables }))
  }

  const generatePreview = (template, field) => {
    let preview = template[field] || ''
    template.variables?.forEach(variable => {
      const value = previewData[variable] || `[${variable}]`
      preview = preview.replace(
        new RegExp(`\\{\\{${variable}\\}\\}`, 'g'),
        value
      )
    })
    return preview
  }

  const predefinedTemplates = [
    {
      name: 'Fee Payment Reminder',
      subject: 'Fee Payment Reminder - {{student_name}} ({{class}})',
      content: `Dear {{parent_name}},

This is a friendly reminder that the fee payment for {{student_name}} studying in Class {{class}} is due.

Payment Details:
- Amount: ₹{{amount}}
- Due Date: {{due_date}}
- Late Fee: ₹{{late_fee}} (applicable after due date)

Please make the payment at your earliest convenience to avoid any inconvenience.

You can pay online through our school portal or visit the school office during working hours.

Thank you for your cooperation.

Best regards,
{{school_name}}
Finance Department`,
      category: 'fees',
    },
    {
      name: 'Exam Schedule Notification',
      subject: '{{exam_name}} Schedule - {{student_name}} ({{class}})',
      content: `Dear {{parent_name}},

We are pleased to inform you about the upcoming {{exam_name}} for your ward {{student_name}} studying in Class {{class}}.

Exam Schedule:
- Start Date: {{start_date}}
- End Date: {{end_date}}
- Reporting Time: {{reporting_time}}
- Venue: {{venue}}

Please ensure that {{student_name}} is well-prepared and reaches school on time for all examinations.

Admit cards will be distributed shortly. Please contact the school office if you have any queries.

Best wishes for the examinations!

Regards,
{{school_name}}
Academic Department`,
      category: 'exams',
    },
    {
      name: 'Event Invitation',
      subject: 'Invitation: {{event_name}} - {{date}}',
      content: `Dear {{parent_name}},

We are delighted to invite you and your family to our upcoming event:

Event Details:
- Event: {{event_name}}
- Date: {{date}}
- Time: {{time}}
- Venue: {{venue}}
- Dress Code: {{dress_code}}

This event promises to be an enriching experience for students and parents alike. Your presence would make the occasion more memorable.

Please confirm your attendance by {{rsvp_date}}.

Looking forward to seeing you there!

Warm regards,
{{school_name}}
Event Committee`,
      category: 'events',
    },
  ]

  const loadPredefinedTemplate = template => {
    const allVariables = [
      ...new Set([
        ...extractVariables(template.subject),
        ...extractVariables(template.content),
      ]),
    ]

    setFormData(prev => ({
      ...prev,
      name: template.name,
      subject: template.subject,
      content: template.content,
      category: template.category,
      variables: allVariables,
    }))
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">📧 Email Templates</h2>

        {/* Quick Templates */}
        <div className="bg-blue-50 p-4 rounded-md mb-6">
          <h3 className="text-lg font-semibold mb-3">Quick Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {Array.isArray(predefinedTemplates) &&
              predefinedTemplates.map((template, index) => (
                <Button
                  key={index}
                  onClick={() => loadPredefinedTemplate(template)}
                  className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
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
                Email Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={e => handleSubjectChange(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
                placeholder="Enter email subject line"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email Content *
              </label>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="isHtml"
                  checked={formData.isHtml}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, isHtml: e.target.checked }))
                  }
                  className="mr-2"
                />
                <label htmlFor="isHtml" className="text-sm">
                  HTML Format
                </label>
              </div>
              <textarea
                value={formData.content}
                onChange={e => handleContentChange(e.target.value)}
                className="w-full p-2 border rounded-md font-mono"
                rows="12"
                required
                placeholder={
                  formData.isHtml
                    ? 'Enter your HTML email content. Use {{variable_name}} for dynamic content.'
                    : 'Enter your email content. Use {{variable_name}} for dynamic content.'
                }
              />
              <div className="text-xs text-gray-600 mt-1">
                Use double curly braces for variables:
                <span className="bg-gray-200 px-1 rounded">
                  {'{student_name}'}
                </span>
                ,
                <span className="bg-gray-200 px-1 rounded">
                  {'{parent_name}'}
                </span>
                ,<span className="bg-gray-200 px-1 rounded">{'{amount}'}</span>,
                etc.
              </div>
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
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono"
                      >
                        {`{${variable}}`}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Preview Section */}
            {(formData.subject || formData.content) && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Preview
                </label>
                <div className="bg-white border rounded-md">
                  <div className="bg-blue-500 text-white p-2 rounded-t text-sm font-medium">
                    Email Preview
                  </div>
                  <div className="p-4 border-l border-r border-b rounded-b">
                    {formData.variables.length > 0 && (
                      <div className="mb-4 p-3 bg-gray-50 rounded">
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

                    <div className="mb-3">
                      <div className="text-xs text-gray-600 mb-1">Subject:</div>
                      <div className="font-semibold text-sm bg-gray-50 p-2 rounded">
                        {generatePreview(formData, 'subject')}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-600 mb-1">Content:</div>
                      <div className="text-sm bg-gray-50 p-3 rounded">
                        {formData.isHtml ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: generatePreview(formData, 'content'),
                            }}
                          />
                        ) : (
                          <div className="whitespace-pre-wrap">
                            {generatePreview(formData, 'content')}
                          </div>
                        )}
                      </div>
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
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
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
              templates.map(template => (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{template.name}</h3>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {template.category}
                      </span>
                      {template.isHtml && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          HTML
                        </span>
                      )}
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

                  <div className="mb-2">
                    <div className="text-xs text-gray-600 mb-1">Subject:</div>
                    <div className="bg-gray-50 p-2 rounded text-sm font-medium">
                      {template.subject}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded mb-2">
                    <div className="text-xs text-gray-600 mb-1">
                      Content Preview:
                    </div>
                    <div className="text-sm max-h-32 overflow-y-auto">
                      {template.isHtml ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: `${template.content.substring(0, 200)}...`,
                          }}
                        />
                      ) : (
                        <div className="whitespace-pre-wrap">
                          {template.content.substring(0, 200)}...
                        </div>
                      )}
                    </div>
                  </div>

                  {template.variables && template.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className="text-xs text-gray-600">Variables:</span>
                      {Array.isArray(template.variables) &&
                        template.variables.map((variable, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs font-mono"
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
              ))}
          </div>
        )}

        {templates.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            No email templates found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  )
}

export default TemplateEmail
