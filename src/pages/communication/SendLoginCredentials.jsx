import React, { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { communicationApi } from '../../lib/api/communication'
import Button from '../../components/Button'

const SendLoginCredentials = () => {
  const [formData, setFormData] = useState({
    userType: 'students',
    recipients: 'all',
    customRecipients: [],
    messageType: 'email',
    includeQR: false,
    resetPassword: false,
    customMessage: '',
  })
  const [filters, setFilters] = useState({
    class: 'all',
    section: 'all',
    status: 'active',
  })
  const [rateLimitInfo, setRateLimitInfo] = useState(null)

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users', formData.userType, filters],
    queryFn: () => communicationApi.getUsers(formData.userType, filters),
  })

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: communicationApi.getClasses,
  })

  const sendCredentialsMutation = useMutation({
    mutationFn: communicationApi.sendLoginCredentials,
    onSuccess: response => {
      alert(`Credentials sent successfully! Job ID: ${response.jobId}`)
      setRateLimitInfo(response.rateLimitInfo)
      resetForm()
    },
    onError: error => {
      if (error.response?.status === 429) {
        alert(
          `Rate limit exceeded. Please wait ${error.response.data.retryAfter} seconds before sending again.`,
        )
        setRateLimitInfo(error.response.data.rateLimitInfo)
      } else {
        alert(`Failed to send credentials: ${error.message}`)
      }
    },
  })

  const previewRecipientsMutation = useMutation({
    mutationFn: () =>
      communicationApi.previewCredentialRecipients({
        userType: formData.userType,
        recipients: formData.recipients,
        filters,
      }),
    onSuccess: data => {
      setFormData(prev => ({ ...prev, customRecipients: data.recipients }))
    },
  })

  const resetForm = () => {
    setFormData({
      userType: 'students',
      recipients: 'all',
      customRecipients: [],
      messageType: 'email',
      includeQR: false,
      resetPassword: false,
      customMessage: '',
    })
  }

  const handleSubmit = e => {
    e.preventDefault()

    if (formData.customRecipients.length === 0) {
      alert(
        'Please preview recipients first to ensure you have selected the correct users.',
      )
      return
    }

    const confirmMessage = `You are about to send login credentials to ${formData.customRecipients.length} ${formData.userType}. This action cannot be undone. Continue?`

    if (window.confirm(confirmMessage)) {
      sendCredentialsMutation.mutate({
        ...formData,
        filters,
      })
    }
  }

  const handlePreviewRecipients = () => {
    previewRecipientsMutation.mutate()
  }

  const getMessageTypeIcon = type => {
    switch (type) {
      case 'whatsapp':
        return '📱'
      case 'email':
        return '📧'
      case 'sms':
        return '💬'
      default:
        return '📄'
    }
  }

  const defaultMessages = {
    email: {
      subject: 'Your School Portal Login Credentials',
      content: `Dear {{name}},

Your login credentials for the school portal are:

Username: {{username}}
Password: {{password}}
Portal URL: {{portal_url}}

Please keep these credentials secure and change your password after first login.

If you have any issues accessing the portal, please contact the school administration.

Best regards,
{{school_name}} Administration`,
    },
    whatsapp: {
      content: `Hello {{name}}, your school portal login details:
Username: {{username}}
Password: {{password}}
Portal: {{portal_url}}

Please keep secure and change password after first login.`,
    },
    sms: {
      content:
        '{{name}}, your login: {{username}}/{{password}} at {{portal_url}}. Change password after first login.',
    },
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🔐</span>
          <h2 className="text-2xl font-bold">Send Login Credentials</h2>
        </div>

        {/* Rate Limit Info */}
        {rateLimitInfo && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-600">⚠️</span>
              <span className="font-medium text-yellow-800">
                Rate Limit Information
              </span>
            </div>
            <div className="text-sm text-yellow-700">
              <div>
                Remaining requests: {rateLimitInfo.remaining}/
                {rateLimitInfo.limit}
              </div>
              <div>
                Reset time: {new Date(rateLimitInfo.resetTime).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Type Selection */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-4">Select User Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  User Type
                </label>
                <select
                  value={formData.userType}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, userType: e.target.value }))
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="students">Students</option>
                  <option value="parents">Parents</option>
                  <option value="teachers">Teachers</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Recipients
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
                  <option value="all">All {formData.userType}</option>
                  <option value="new">New Users Only</option>
                  <option value="inactive">Inactive Users</option>
                  <option value="custom">Custom Selection</option>
                </select>
              </div>

              {(formData.userType === 'students' ||
                formData.userType === 'parents') && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Class Filter
                    </label>
                    <select
                      value={filters.class}
                      onChange={e =>
                        setFilters(prev => ({ ...prev, class: e.target.value }))
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
                      Section Filter
                    </label>
                    <select
                      value={filters.section}
                      onChange={e =>
                        setFilters(prev => ({
                          ...prev,
                          section: e.target.value,
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="all">All Sections</option>
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4">
              <Button
                type="button"
                onClick={handlePreviewRecipients}
                disabled={previewRecipientsMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {previewRecipientsMutation.isPending
                  ? 'Loading...'
                  : `Preview Recipients (${formData.customRecipients.length})`}
              </Button>
            </div>

            {formData.customRecipients.length > 0 && (
              <div className="mt-4 bg-white p-3 rounded border max-h-40 overflow-y-auto">
                <p className="text-sm font-medium mb-2">
                  Selected Recipients ({formData.customRecipients.length}):
                </p>
                <div className="space-y-1">
                  {Array.isArray(formData.customRecipients) &&
                    formData.customRecipients
                      .slice(0, 10)
                      .map((recipient, index) => (
                        <div
                          key={index}
                          className="text-xs bg-gray-100 px-2 py-1 rounded flex justify-between"
                        >
                          <span>{recipient.name}</span>
                          <span className="text-gray-600">
                            {recipient.contact}
                          </span>
                        </div>
                      ))}
                  {formData.customRecipients.length > 10 && (
                    <div className="text-xs text-gray-500">
                      ... and {formData.customRecipients.length - 10} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Message Configuration */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-4">
              Message Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Message Type
                </label>
                <select
                  value={formData.messageType}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      messageType: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="email">📧 Email</option>
                  <option value="whatsapp">📱 WhatsApp</option>
                  <option value="sms">💬 SMS</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeQR"
                  checked={formData.includeQR}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      includeQR: e.target.checked,
                    }))
                  }
                  className="mr-2"
                />
                <label htmlFor="includeQR" className="text-sm font-medium">
                  Include QR Code
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="resetPassword"
                  checked={formData.resetPassword}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      resetPassword: e.target.checked,
                    }))
                  }
                  className="mr-2"
                />
                <label htmlFor="resetPassword" className="text-sm font-medium">
                  Force Password Reset
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Custom Message (Optional)
                <span className="text-xs text-gray-500 ml-2">
                  Leave empty to use default template
                </span>
              </label>
              <textarea
                value={formData.customMessage}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    customMessage: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded-md"
                rows="4"
                placeholder={
                  defaultMessages[formData.messageType]?.content || ''
                }
              />
              <div className="text-xs text-gray-600 mt-1">
                Available variables: <code>{'{name}'}</code>,{' '}
                <code>{'{username}'}</code>, <code>{'{password}'}</code>,{' '}
                <code>{'{portal_url}'}</code>, <code>{'{school_name}'}</code>
              </div>
            </div>
          </div>

          {/* Security Warning */}
          <div className="bg-red-50 border border-red-200 p-4 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-600">🔒</span>
              <span className="font-medium text-red-800">Security Notice</span>
            </div>
            <div className="text-sm text-red-700 space-y-1">
              <div>• Login credentials contain sensitive information</div>
              <div>
                • Messages are sent securely but recipients should change
                passwords immediately
              </div>
              <div>
                • This action is logged and monitored for security purposes
              </div>
              <div>• Rate limiting is enforced to prevent abuse</div>
            </div>
          </div>

          {/* Preview */}
          {formData.customRecipients.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-3">
                {getMessageTypeIcon(formData.messageType)} Message Preview
              </h3>
              <div className="bg-white p-3 rounded border">
                {formData.messageType === 'email' && (
                  <div className="mb-2">
                    <div className="text-xs text-gray-600">Subject:</div>
                    <div className="font-medium text-sm">
                      {defaultMessages.email.subject}
                    </div>
                  </div>
                )}
                <div className="text-xs text-gray-600 mb-1">Content:</div>
                <div className="text-sm whitespace-pre-wrap">
                  {formData.customMessage ||
                    defaultMessages[formData.messageType]?.content}
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={
                sendCredentialsMutation.isPending ||
                formData.customRecipients.length === 0
              }
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
            >
              {sendCredentialsMutation.isPending
                ? 'Sending...'
                : `Send Credentials to ${formData.customRecipients.length} Users`}
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

export default SendLoginCredentials
