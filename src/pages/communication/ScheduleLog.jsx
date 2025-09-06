import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { communicationApi } from '../../lib/api/communication'
import Button from '../../components/Button'

const ScheduleLog = () => {
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
  })

  const queryClient = useQueryClient()

  const { data: scheduledMessagesData, isLoading } = useQuery({
    queryKey: ['scheduledMessages', filters],
    queryFn: () => communicationApi.getScheduledMessages(filters),
  })

  // Ensure scheduledMessages is always an array
  const scheduledMessages = Array.isArray(scheduledMessagesData?.data)
    ? scheduledMessagesData.data
    : Array.isArray(scheduledMessagesData)
      ? scheduledMessagesData
      : []

  const cancelScheduleMutation = useMutation({
    mutationFn: communicationApi.cancelScheduledMessage,
    onSuccess: () => {
      queryClient.invalidateQueries(['scheduledMessages'])
      alert('Scheduled message cancelled successfully!')
    },
  })

  const rescheduleMessageMutation = useMutation({
    mutationFn: ({ id, newDateTime }) =>
      communicationApi.rescheduleMessage(id, newDateTime),
    onSuccess: () => {
      queryClient.invalidateQueries(['scheduledMessages'])
      alert('Message rescheduled successfully!')
    },
  })

  const handleFilterChange = e => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleCancelSchedule = id => {
    if (
      window.confirm('Are you sure you want to cancel this scheduled message?')
    ) {
      cancelScheduleMutation.mutate(id)
    }
  }

  const handleReschedule = id => {
    const newDate = prompt('Enter new date (YYYY-MM-DD):')
    const newTime = prompt('Enter new time (HH:MM):')

    if (newDate && newTime) {
      const newDateTime = `${newDate} ${newTime}`
      rescheduleMessageMutation.mutate({ id, newDateTime })
    }
  }

  const getStatusColor = status => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'sent':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = type => {
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

  const isScheduleEditable = status => {
    return ['scheduled'].includes(status)
  }

  const getTimeUntilExecution = scheduledAt => {
    const now = new Date()
    const scheduled = new Date(scheduledAt)
    const diff = scheduled - now

    if (diff <= 0) return 'Overdue'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const stats = {
    total: scheduledMessages.length,
    scheduled: scheduledMessages.filter(msg => msg.status === 'scheduled')
      .length,
    processing: scheduledMessages.filter(msg => msg.status === 'processing')
      .length,
    sent: scheduledMessages.filter(msg => msg.status === 'sent').length,
    failed: scheduledMessages.filter(msg => msg.status === 'failed').length,
    cancelled: scheduledMessages.filter(msg => msg.status === 'cancelled')
      .length,
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">📅 Scheduled Messages</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-700">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-700">
              {stats.scheduled}
            </div>
            <div className="text-sm text-blue-600">Scheduled</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-700">
              {stats.processing}
            </div>
            <div className="text-sm text-yellow-600">Processing</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-700">
              {stats.sent}
            </div>
            <div className="text-sm text-green-600">Sent</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-700">
              {stats.failed}
            </div>
            <div className="text-sm text-red-600">Failed</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-700">
              {stats.cancelled}
            </div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Message Type
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="all">All Types</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
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
              <option value="scheduled">Scheduled</option>
              <option value="processing">Processing</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
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

        {/* Scheduled Messages List */}
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="space-y-4">
            {Array.isArray(scheduledMessages) &&
              scheduledMessages.map(message => (
                <div
                  key={message.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {getTypeIcon(message.type)}
                      </span>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {message.subject ||
                            `${message.type.toUpperCase()} Message`}
                        </h3>
                        <div className="text-sm text-gray-600">
                          To: {message.recipientCount} recipient
                          {message.recipientCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${getStatusColor(message.status)}`}
                      >
                        {message.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-gray-600">Scheduled For</div>
                      <div className="font-medium">
                        {new Date(message.scheduledAt).toLocaleString()}
                      </div>
                      {message.status === 'scheduled' && (
                        <div className="text-xs text-blue-600">
                          In {getTimeUntilExecution(message.scheduledAt)}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-sm text-gray-600">Created</div>
                      <div className="font-medium">
                        {new Date(message.createdAt).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        by {message.createdBy}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600">Job ID</div>
                      <div className="font-mono text-sm">{message.jobId}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-sm text-gray-600 mb-1">
                      Message Preview
                    </div>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      {message.content?.substring(0, 150)}
                      {message.content?.length > 150 && '...'}
                    </div>
                  </div>

                  {message.error && (
                    <div className="mb-3">
                      <div className="text-sm text-gray-600 mb-1">Error</div>
                      <div className="bg-red-50 p-3 rounded text-sm text-red-800 border border-red-200">
                        {message.error}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {isScheduleEditable(message.status) && (
                      <>
                        <Button
                          onClick={() => handleReschedule(message.id)}
                          disabled={rescheduleMessageMutation.isPending}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Reschedule
                        </Button>
                        <Button
                          onClick={() => handleCancelSchedule(message.id)}
                          disabled={cancelScheduleMutation.isPending}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                        >
                          Cancel
                        </Button>
                      </>
                    )}

                    {message.status === 'sent' && (
                      <Button
                        onClick={() =>
                          window.open(
                            `/communication/log?jobId=${message.jobId}`,
                            '_blank',
                          )
                        }
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                      >
                        View Delivery Log
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}

        {scheduledMessages.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-6xl mb-4">📅</div>
            <div className="text-xl mb-2">No scheduled messages found</div>
            <div className="text-sm">
              Messages you schedule will appear here
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ScheduleLog
