import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  FileText,
  MessageSquare,
  Download,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { leaveRequestsApi } from '../../lib/api/leaveRequests'

const LeaveRequestCard = ({ request, onApprove, onReject, onViewDetails }) => {
  const getStatusColor = status => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100'
      case 'rejected':
        return 'text-red-600 bg-red-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = type => {
    switch (type) {
      case 'sick':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'personal':
        return <User className="w-4 h-4 text-blue-500" />
      case 'emergency':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />
    }
  }

  const calculateDays = () => {
    const start = new Date(request.startDate)
    const end = new Date(request.endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-medium">{request.userName}</h3>
            <p className="text-sm text-gray-500">
              {request.userType === 'student'
                ? `Roll: ${request.rollNumber}`
                : `ID: ${request.employeeId}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getTypeIcon(request.type)}
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}
          >
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date(request.startDate).toLocaleDateString()} -{' '}
            {new Date(request.endDate).toLocaleDateString()}({calculateDays()}{' '}
            day{calculateDays() > 1 ? 's' : ''})
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>
            Applied: {new Date(request.appliedAt).toLocaleDateString()}
          </span>
        </div>
        <div className="text-sm">
          <span className="font-medium">Reason: </span>
          <span className="text-gray-600">{request.reason}</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => onViewDetails(request)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
        >
          <FileText className="w-4 h-4" />
          View Details
        </button>

        {request.status === 'pending' && (
          <div className="flex gap-2">
            <button
              onClick={() => onReject(request.id)}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-1"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
            <button
              onClick={() => onApprove(request.id)}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const LeaveDetailsDialog = ({ request, open, onClose }) => {
  if (!request) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Leave Request Details"
      size="lg"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Applicant
            </label>
            <p className="text-sm">{request.userName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <p className="text-sm capitalize">{request.userType}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type
            </label>
            <p className="text-sm capitalize">{request.type}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <p className="text-sm capitalize">{request.status}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <p className="text-sm">
              {new Date(request.startDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <p className="text-sm">
              {new Date(request.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason
          </label>
          <p className="text-sm bg-gray-50 p-3 rounded">{request.reason}</p>
        </div>

        {request.attachments && request.attachments.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments
            </label>
            <div className="space-y-2">
              {Array.isArray(request.attachments) &&
                request.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                  >
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{attachment}</span>
                    <button className="ml-auto text-blue-600 hover:text-blue-800 text-sm">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {request.remarks && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <p className="text-sm bg-gray-50 p-3 rounded">{request.remarks}</p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const ApprovalDialog = ({ request, action, open, onClose, onConfirm }) => {
  const [remarks, setRemarks] = useState('')

  const handleConfirm = () => {
    onConfirm(request?.id, remarks)
    setRemarks('')
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`${action === 'approve' ? 'Approve' : 'Reject'} Leave Request`}
    >
      <div className="space-y-4">
        <p>
          Are you sure you want to {action} the leave request from{' '}
          <strong>{request?.userName}</strong>?
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Remarks {action === 'reject' ? '(Required)' : '(Optional)'}
          </label>
          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder={`Add remarks for ${action}ing this request...`}
            className="w-full border rounded-lg px-3 py-2 h-20 resize-none"
            required={action === 'reject'}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={action === 'reject' && !remarks.trim()}
            className={`px-4 py-2 rounded-lg text-white disabled:opacity-50 ${
              action === 'approve'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {action === 'approve' ? 'Approve' : 'Reject'}
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const ApproveLeave = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [userTypeFilter, setUserTypeFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showApproval, setShowApproval] = useState(false)
  const [approvalAction, setApprovalAction] = useState('approve')

  const queryClient = useQueryClient()

  const { data: leaveRequestsData, isLoading } = useQuery({
    queryKey: ['leave-requests', 'pending-approval'],
    queryFn: () => leaveRequestsApi.getPendingRequests(),
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, remarks }) => leaveRequestsApi.approve(id, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries(['leave-requests'])
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, remarks }) => leaveRequestsApi.reject(id, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries(['leave-requests'])
    },
  })

  const handleApprove = requestId => {
    const request = leaveRequestsData?.data?.find(r => r.id === requestId)
    setSelectedRequest(request)
    setApprovalAction('approve')
    setShowApproval(true)
  }

  const handleReject = requestId => {
    const request = leaveRequestsData?.data?.find(r => r.id === requestId)
    setSelectedRequest(request)
    setApprovalAction('reject')
    setShowApproval(true)
  }

  const handleViewDetails = request => {
    setSelectedRequest(request)
    setShowDetails(true)
  }

  const handleConfirmApproval = (requestId, remarks) => {
    if (approvalAction === 'approve') {
      approveMutation.mutate({ id: requestId, remarks })
    } else {
      rejectMutation.mutate({ id: requestId, remarks })
    }
  }

  const filteredRequests =
    leaveRequestsData?.data?.filter(request => {
      const matchesSearch =
        request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.reason.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus =
        statusFilter === 'all' || request.status === statusFilter
      const matchesType = typeFilter === 'all' || request.type === typeFilter
      const matchesUserType =
        userTypeFilter === 'all' || request.userType === userTypeFilter

      return matchesSearch && matchesStatus && matchesType && matchesUserType
    }) || []

  const getStatusCounts = () => {
    const requests = leaveRequestsData?.data || []
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
    }
  }

  const counts = getStatusCounts()

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Leave Approval</h1>
        <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{counts.total}</p>
              <p className="text-sm text-gray-600">Total Requests</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">{counts.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{counts.approved}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold">{counts.rejected}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Types</option>
            <option value="sick">Sick Leave</option>
            <option value="personal">Personal</option>
            <option value="emergency">Emergency</option>
            <option value="vacation">Vacation</option>
          </select>
          <select
            value={userTypeFilter}
            onChange={e => setUserTypeFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Users</option>
            <option value="student">Students</option>
            <option value="staff">Staff</option>
          </select>
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Leave Requests */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Leave Requests
            </h3>
            <p className="text-gray-500">
              No leave requests match your current filters.
            </p>
          </div>
        ) : (
          filteredRequests.map(request => (
            <LeaveRequestCard
              key={request.id}
              request={request}
              onApprove={handleApprove}
              onReject={handleReject}
              onViewDetails={handleViewDetails}
            />
          ))
        )}
      </div>

      {/* Details Dialog */}
      <LeaveDetailsDialog
        request={selectedRequest}
        open={showDetails}
        onClose={() => setShowDetails(false)}
      />

      {/* Approval Dialog */}
      <ApprovalDialog
        request={selectedRequest}
        action={approvalAction}
        open={showApproval}
        onClose={() => setShowApproval(false)}
        onConfirm={handleConfirmApproval}
      />
    </div>
  )
}

export default ApproveLeave
