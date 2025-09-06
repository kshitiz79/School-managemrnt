import React, { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { communicationApi } from '../../lib/api/communication'
import Button from '../../components/Button'

const SendMessage = () => {
  const [activeTab, setActiveTab] = useState('whatsapp')
  const [formData, setFormData] = useState({
    recipients: 'all',
    customRecipients: [],
    subject: '',
    message: '',
    template: '',
    attachments: [],
    scheduleDate: '',
    scheduleTime: '',
    isScheduled: false,
  })
  const [segmentFilters, setSegmentFilters] = useState({
    role: 'all',
    class: 'all',
    feeStatus: 'all',
    customQuery: '',
  })

  const { data: templates = [] } = useQuery({
    queryKey: ['templates', activeTab],
    queryFn: () => communicationApi.getTemplates(activeTab),
  })

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: communicationApi.getClasses,
  })

  const sendMessageMutation = useMutation({
    mutationFn: communicationApi.sendMessage,
    onSuccess: response => {
      alert(`Message sent successfully! Job ID: ${response.jobId}`)
      resetForm()
    },
    onError: error => {
      alert(`Failed to send message: ${error.message}`)
    },
  })

  const previewRecipientsMutation = useMutation({
    mutationFn: communicationApi.previewRecipients,
    onSuccess: data => {
      setFormData(prev => ({ ...prev, customRecipients: data.recipients }))
    },
  })

  const resetForm = () => {
    setFormData({
      recipients: 'all',
      customRecipients: [],
      subject: '',
      message: '',
      template: '',
      attachments: [],
      scheduleDate: '',
      scheduleTime: '',
      isScheduled: false,
    })
  }

  const handleSubmit = e => {
    e.preventDefault()
    const submitData = new FormData()

    submitData.append('type', activeTab)
    submitData.append('recipients', formData.recipients)
    submitData.append('subject', formData.subject)
    submitData.append('message', formData.message)
    submitData.append('template', formData.template)
    submitData.append('isScheduled', formData.isScheduled)

    if (formData.isScheduled) {
      submitData.append('scheduleDate', formData.scheduleDate)
      submitData.append('scheduleTime', formData.scheduleTime)
    }

    // Add segment filters
    Object.keys(segmentFilters).forEach(key => {
      submitData.append(`filter_${key}`, segmentFilters[key])
    })

    // Add custom recipients if any
    if (formData.customRecipients.length > 0) {
      submitData.append(
        'customRecipients',
        JSON.stringify(formData.customRecipients),
      )
    }

    // Add attachments
    formData.attachments.forEach(file => {
      submitData.append('attachments', file)
    })

    sendMessageMutation.mutate(submitData)
  }

  const handleTemplateSelect = templateId => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setFormData(prev => ({
        ...prev,
        template: templateId,
        subject: template.subject || prev.subject,
        message: template.content,
      }))
    }
  }

  const handlePreviewRecipients = () => {
    previewRecipientsMutation.mutate({
      recipients: formData.recipients,
      filters: segmentFilters,
    })
  }

  const getTabConfig = tab => {
    const configs = {
      whatsapp: {
        title: 'WhatsApp',
        icon: '📱',
        color: 'bg-green-600',
        maxLength: 1600,
        supportsAttachments: true,
        requiresSubject: false,
      },
      email: {
        title: 'Email',
        icon: '📧',
        color: 'bg-blue-600',
        maxLength: null,
        supportsAttachments: true,
        requiresSubject: true,
      },
      sms: {
        title: 'SMS',
        icon: '💬',
        color: 'bg-purple-600',
        maxLength: 160,
        supportsAttachments: false,
        requiresSubject: false,
      },
    }
    return configs[tab]
  }

  const currentConfig = getTabConfig(activeTab)

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Send Message</h2>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {['whatsapp', 'email', 'sms'].map(tab => {
            const config = getTabConfig(tab)
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-t-lg font-medium ${
                  activeTab === tab
                    ? `${config.color} text-white`
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {config.icon} {config.title}
              </button>
            )
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient Selection */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-4">
              Recipients & Segmentation
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Recipient Type
                </label>
                <select
                  value={formData.recipients}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      recipients: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="all">All Users</option>
                  <option value="students">Students</option>
                  <option value="parents">Parents</option>
                  <option value="teachers">Teachers</option>
                  <option value="staff">Staff</option>
                  <option value="custom">Custom Segment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Role Filter
                </label>
                <select
                  value={segmentFilters.role}
                  onChange={e =>
                    setSegmentFilters(prev => ({
                      ...prev,
                      role: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Student</option>
                  <option value="parent">Parent</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Class Filter
                </label>
                <select
                  value={segmentFilters.class}
                  onChange={e =>
                    setSegmentFilters(prev => ({
                      ...prev,
                      class: e.target.value,
                    }))
                  }
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
                  Fee Status
                </label>
                <select
                  value={segmentFilters.feeStatus}
                  onChange={e =>
                    setSegmentFilters(prev => ({
                      ...prev,
                      feeStatus: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <Button
                type="button"
                onClick={handlePreviewRecipients}
                disabled={previewRecipientsMutation.isPending}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Preview Recipients ({formData.customRecipients.length})
              </Button>
            </div>

            {formData.customRecipients.length > 0 && (
              <div className="bg-white p-3 rounded border max-h-32 overflow-y-auto">
                <p className="text-sm font-medium mb-2">Selected Recipients:</p>
                <div className="text-xs text-gray-600">
                  {Array.isArray(formData.customRecipients) &&
                    formData.customRecipients
                      .slice(0, 10)
                      .map((recipient, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-100 px-2 py-1 rounded mr-1 mb-1"
                        >
                          {recipient.name} ({recipient.contact})
                        </span>
                      ))}
                  {formData.customRecipients.length > 10 && (
                    <span className="text-gray-500">
                      ... and {formData.customRecipients.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Template (Optional)
            </label>
            <select
              value={formData.template}
              onChange={e => handleTemplateSelect(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select a template</option>
              {Array.isArray(templates) &&
                templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Subject (Email only) */}
          {currentConfig.requiresSubject && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={e =>
                  setFormData(prev => ({ ...prev, subject: e.target.value }))
                }
                className="w-full p-2 border rounded-md"
                required={currentConfig.requiresSubject}
              />
            </div>
          )}

          {/* Message Content */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Message *
              {currentConfig.maxLength && (
                <span className="text-gray-500 ml-2">
                  ({formData.message.length}/{currentConfig.maxLength}{' '}
                  characters)
                </span>
              )}
            </label>
            <textarea
              value={formData.message}
              onChange={e =>
                setFormData(prev => ({ ...prev, message: e.target.value }))
              }
              className="w-full p-2 border rounded-md"
              rows="6"
              maxLength={currentConfig.maxLength}
              required
              placeholder={`Enter your ${currentConfig.title.toLowerCase()} message here...`}
            />
          </div>

          {/* Attachments */}
          {currentConfig.supportsAttachments && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Attachments
              </label>
              <input
                type="file"
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    attachments: Array.from(e.target.files),
                  }))
                }
                className="w-full p-2 border rounded-md"
                multiple
                accept={
                  activeTab === 'whatsapp'
                    ? '.pdf,.jpg,.jpeg,.png'
                    : '.pdf,.jpg,.jpeg,.png,.doc,.docx'
                }
              />
            </div>
          )}

          {/* Scheduling */}
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="isScheduled"
                checked={formData.isScheduled}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    isScheduled: e.target.checked,
                  }))
                }
                className="mr-2"
              />
              <label htmlFor="isScheduled" className="text-sm font-medium">
                Schedule for Later
              </label>
            </div>

            {formData.isScheduled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Schedule Date
                  </label>
                  <input
                    type="date"
                    value={formData.scheduleDate}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        scheduleDate: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded-md"
                    required={formData.isScheduled}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Schedule Time
                  </label>
                  <input
                    type="time"
                    value={formData.scheduleTime}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        scheduleTime: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded-md"
                    required={formData.isScheduled}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={sendMessageMutation.isPending}
              className={`${currentConfig.color} text-white px-6 py-2 rounded-md hover:opacity-90`}
            >
              {sendMessageMutation.isPending
                ? 'Sending...'
                : `Send ${currentConfig.title}`}
            </Button>
            <Button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
            >
              Reset
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SendMessage
