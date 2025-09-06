import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { communicationApi } from '../../lib/api/communication'
import Button from '../../components/Button'

const NoticeBoard = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    audience: 'all',
    priority: 'normal',
    isPinned: false,
    isScheduled: false,
    scheduledDate: '',
    scheduledTime: '',
    expiryDate: '',
    attachments: [],
  })
  const [editingId, setEditingId] = useState(null)
  const [filters, setFilters] = useState({
    audience: 'all',
    priority: 'all',
    status: 'all',
  })

  const queryClient = useQueryClient()

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ['notices', filters],
    queryFn: () => communicationApi.getNotices(filters),
  })

  const addNoticeMutation = useMutation({
    mutationFn: communicationApi.addNotice,
    onSuccess: () => {
      queryClient.invalidateQueries(['notices'])
      resetForm()
      alert('Notice added successfully!')
    },
  })

  const updateNoticeMutation = useMutation({
    mutationFn: ({ id, data }) => communicationApi.updateNotice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['notices'])
      resetForm()
      alert('Notice updated successfully!')
    },
  })

  const deleteNoticeMutation = useMutation({
    mutationFn: communicationApi.deleteNotice,
    onSuccess: () => {
      queryClient.invalidateQueries(['notices'])
      alert('Notice deleted successfully!')
    },
  })

  const togglePinMutation = useMutation({
    mutationFn: ({ id, isPinned }) => communicationApi.togglePin(id, isPinned),
    onSuccess: () => {
      queryClient.invalidateQueries(['notices'])
    },
  })

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      audience: 'all',
      priority: 'normal',
      isPinned: false,
      isScheduled: false,
      scheduledDate: '',
      scheduledTime: '',
      expiryDate: '',
      attachments: [],
    })
    setEditingId(null)
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

    if (editingId) {
      updateNoticeMutation.mutate({ id: editingId, data: submitData })
    } else {
      addNoticeMutation.mutate(submitData)
    }
  }

  const handleEdit = notice => {
    setFormData({
      title: notice.title,
      content: notice.content,
      audience: notice.audience,
      priority: notice.priority,
      isPinned: notice.isPinned,
      isScheduled: notice.isScheduled,
      scheduledDate: notice.scheduledDate || '',
      scheduledTime: notice.scheduledTime || '',
      expiryDate: notice.expiryDate || '',
      attachments: [],
    })
    setEditingId(notice.id)
  }

  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      deleteNoticeMutation.mutate(id)
    }
  }

  const handleTogglePin = (id, currentPinStatus) => {
    togglePinMutation.mutate({ id, isPinned: !currentPinStatus })
  }

  const handleFileChange = e => {
    const files = Array.from(e.target.files)
    setFormData(prev => ({ ...prev, attachments: files }))
  }

  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  const getAudienceLabel = audience => {
    const labels = {
      all: 'All Users',
      students: 'Students',
      parents: 'Parents',
      teachers: 'Teachers',
      staff: 'Staff',
      admin: 'Admin',
    }
    return labels[audience] || audience
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Notice Board Management</h2>

        {/* Add/Edit Form */}
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Notice' : 'Add New Notice'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Title *
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
                  Audience *
                </label>
                <select
                  value={formData.audience}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, audience: e.target.value }))
                  }
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="all">All Users</option>
                  <option value="students">Students</option>
                  <option value="parents">Parents</option>
                  <option value="teachers">Teachers</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, priority: e.target.value }))
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      expiryDate: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={formData.isPinned}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      isPinned: e.target.checked,
                    }))
                  }
                  className="mr-2"
                />
                <label htmlFor="isPinned" className="text-sm font-medium">
                  Pin to Top
                </label>
              </div>
            </div>

            {/* Scheduling Options */}
            <div className="border-t pt-4">
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
                      Scheduled Date
                    </label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          scheduledDate: e.target.value,
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                      required={formData.isScheduled}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Scheduled Time
                    </label>
                    <input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          scheduledTime: e.target.value,
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                      required={formData.isScheduled}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={e =>
                  setFormData(prev => ({ ...prev, content: e.target.value }))
                }
                className="w-full p-2 border rounded-md"
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Attachments
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full p-2 border rounded-md"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={
                  addNoticeMutation.isPending || updateNoticeMutation.isPending
                }
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                {editingId ? 'Update' : 'Add'} Notice
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
              Filter by Audience
            </label>
            <select
              value={filters.audience}
              onChange={e =>
                setFilters(prev => ({ ...prev, audience: e.target.value }))
              }
              className="w-full p-2 border rounded-md"
            >
              <option value="all">All Audiences</option>
              <option value="students">Students</option>
              <option value="parents">Parents</option>
              <option value="teachers">Teachers</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Filter by Priority
            </label>
            <select
              value={filters.priority}
              onChange={e =>
                setFilters(prev => ({ ...prev, priority: e.target.value }))
              }
              className="w-full p-2 border rounded-md"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="normal">Normal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Filter by Status
            </label>
            <select
              value={filters.status}
              onChange={e =>
                setFilters(prev => ({ ...prev, status: e.target.value }))
              }
              className="w-full p-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Notices List */}
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="space-y-4">
            {Array.isArray(notices) &&
              notices.map(notice => (
                <div
                  key={notice.id}
                  className={`border rounded-lg p-4 ${notice.isPinned ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {notice.isPinned && (
                        <span className="text-blue-600 text-sm">📌 Pinned</span>
                      )}
                      <h3 className="text-lg font-semibold">{notice.title}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs border ${getPriorityColor(notice.priority)}`}
                      >
                        {notice.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          handleTogglePin(notice.id, notice.isPinned)
                        }
                        className={`px-3 py-1 rounded text-sm ${notice.isPinned ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {notice.isPinned ? 'Unpin' : 'Pin'}
                      </Button>
                      <Button
                        onClick={() => handleEdit(notice)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(notice.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    <span>Audience: {getAudienceLabel(notice.audience)}</span>
                    {notice.isScheduled && (
                      <span className="ml-4">
                        Scheduled: {notice.scheduledDate} at{' '}
                        {notice.scheduledTime}
                      </span>
                    )}
                    {notice.expiryDate && (
                      <span className="ml-4">Expires: {notice.expiryDate}</span>
                    )}
                  </div>

                  <p className="text-gray-700 mb-2">{notice.content}</p>

                  {notice.attachments && notice.attachments.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {Array.isArray(notice.attachments) &&
                        notice.attachments.map((attachment, index) => (
                          <a
                            key={index}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            📎 {attachment.name}
                          </a>
                        ))}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-2">
                    Created: {notice.createdAt} | Status: {notice.status}
                  </div>
                </div>
              ))}
          </div>
        )}

        {notices.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            No notices found matching the criteria.
          </div>
        )}
      </div>
    </div>
  )
}

export default NoticeBoard
