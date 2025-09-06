import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { communicationApi } from '../../lib/api/communication'
import Button from '../../components/Button'
import { exportToCSV, exportToPDF } from '../../lib/export'

const Log = () => {
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    recipient: '',
  })
  const [selectedLog, setSelectedLog] = useState(null)

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['communicationLogs', filters],
    queryFn: () => communicationApi.getCommunicationLogs(filters),
  })

  const { data: logDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['communicationLogDetails', selectedLog],
    queryFn: () => communicationApi.getLogDetails(selectedLog),
    enabled: !!selectedLog,
  })

  const handleFilterChange = e => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleExportCSV = () => {
    const exportData = Array.isArray(logs)
      ? logs.map(log => ({
          'Date/Time': log.createdAt,
          Type: log.type.toUpperCase(),
          Recipient: log.recipient,
          'Subject/Content':
            log.subject || `${log.content?.substring(0, 50)}...`,
          Status: log.status,
          'Delivery Status': log.deliveryStatus,
          Error: log.error || '',
        }))
      : []
    exportToCSV(exportData, 'communication-logs')
  }

  const handleExportPDF = () => {
    const columns = ['Date/Time', 'Type', 'Recipient', 'Status', 'Delivery']
    const data = logs.map(log => [
      log.createdAt,
      log.type.toUpperCase(),
      log.recipient,
      log.status,
      log.deliveryStatus,
    ])
    exportToPDF(columns, data, 'Communication Logs')
  }

  const getStatusColor = status => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDeliveryStatusColor = status => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'read':
        return 'bg-blue-100 text-blue-800'
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

  const stats = {
    total: logs.length,
    sent: logs.filter(log => log.status === 'sent').length,
    failed: logs.filter(log => log.status === 'failed').length,
    pending: logs.filter(log => log.status === 'pending').length,
    delivered: logs.filter(log => log.deliveryStatus === 'delivered').length,
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Communication Logs</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-700">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Total Messages</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-700">
              {stats.sent}
            </div>
            <div className="text-sm text-green-600">Sent</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-700">
              {stats.delivered}
            </div>
            <div className="text-sm text-blue-600">Delivered</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-700">
              {stats.pending}
            </div>
            <div className="text-sm text-yellow-600">Pending</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-700">
              {stats.failed}
            </div>
            <div className="text-sm text-red-600">Failed</div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="scheduled">Scheduled</option>
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

          <div>
            <label className="block text-sm font-medium mb-2">Recipient</label>
            <input
              type="text"
              name="recipient"
              value={filters.recipient}
              onChange={handleFilterChange}
              placeholder="Search recipient..."
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={handleExportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Export CSV
          </Button>
          <Button
            onClick={handleExportPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Export PDF
          </Button>
        </div>

        {/* Logs Table */}
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Date/Time
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Type
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Recipient
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Subject/Content
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Status
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Delivery
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(logs) &&
                  logs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 text-sm">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex items-center gap-2">
                          <span>{getTypeIcon(log.type)}</span>
                          <span className="text-sm font-medium">
                            {log.type.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">
                        <div>
                          <div className="font-medium">{log.recipientName}</div>
                          <div className="text-gray-600">{log.recipient}</div>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">
                        <div className="max-w-xs">
                          {log.subject && (
                            <div className="font-medium mb-1">
                              {log.subject}
                            </div>
                          )}
                          <div className="text-gray-600 truncate">
                            {log.content?.substring(0, 50)}...
                          </div>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs ${getStatusColor(log.status)}`}
                        >
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs ${getDeliveryStatusColor(log.deliveryStatus)}`}
                        >
                          {log.deliveryStatus?.toUpperCase() || 'N/A'}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <Button
                          onClick={() => setSelectedLog(log.id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {logs.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            No communication logs found matching the criteria.
          </div>
        )}

        {/* Log Details Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Message Details</h3>
                <Button
                  onClick={() => setSelectedLog(null)}
                  className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                >
                  Close
                </Button>
              </div>

              {isLoadingDetails ? (
                <div className="text-center py-4">Loading details...</div>
              ) : (
                logDetails && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Message ID
                        </label>
                        <div className="text-sm font-mono">{logDetails.id}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Type
                        </label>
                        <div className="flex items-center gap-2">
                          <span>{getTypeIcon(logDetails.type)}</span>
                          <span>{logDetails.type.toUpperCase()}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Sent At
                        </label>
                        <div className="text-sm">
                          {new Date(logDetails.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Status
                        </label>
                        <span
                          className={`px-2 py-1 rounded text-xs ${getStatusColor(logDetails.status)}`}
                        >
                          {logDetails.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Recipient
                      </label>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="font-medium">
                          {logDetails.recipientName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {logDetails.recipient}
                        </div>
                      </div>
                    </div>

                    {logDetails.subject && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          Subject
                        </label>
                        <div className="bg-gray-50 p-3 rounded">
                          {logDetails.subject}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Content
                      </label>
                      <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                        <div className="whitespace-pre-wrap text-sm">
                          {logDetails.content}
                        </div>
                      </div>
                    </div>

                    {logDetails.deliveryStatus && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          Delivery Status
                        </label>
                        <div className="bg-gray-50 p-3 rounded">
                          <span
                            className={`px-2 py-1 rounded text-xs ${getDeliveryStatusColor(logDetails.deliveryStatus)}`}
                          >
                            {logDetails.deliveryStatus.toUpperCase()}
                          </span>
                          {logDetails.deliveredAt && (
                            <div className="text-sm text-gray-600 mt-1">
                              Delivered at:{' '}
                              {new Date(
                                logDetails.deliveredAt,
                              ).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {logDetails.error && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          Error Details
                        </label>
                        <div className="bg-red-50 p-3 rounded border border-red-200">
                          <div className="text-sm text-red-800">
                            {logDetails.error}
                          </div>
                        </div>
                      </div>
                    )}

                    {logDetails.metadata && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          Metadata
                        </label>
                        <div className="bg-gray-50 p-3 rounded">
                          <pre className="text-xs overflow-x-auto">
                            {JSON.stringify(logDetails.metadata, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Log
