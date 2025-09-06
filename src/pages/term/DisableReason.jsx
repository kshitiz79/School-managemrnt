import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  UserX,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  User,
  School,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { disableReasonApi } from '../../lib/api/disableReason'

const DisableReasonCard = ({ reason, onEdit, onDelete, onViewDetails }) => {
  const getStatusColor = status => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'resolved':
        return 'text-blue-600 bg-blue-100'
      case 'expired':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-yellow-600 bg-yellow-100'
    }
  }

  const getSeverityColor = severity => {
    switch (severity) {
      case 'low':
        return 'text-green-600 bg-green-100 border-green-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'high':
        return 'text-red-600 bg-red-100 border-red-200'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const isExpired = reason.endDate && new Date(reason.endDate) < new Date()
  const daysRemaining = reason.endDate
    ? Math.ceil((new Date(reason.endDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-medium">{reason.studentName}</h3>
            <p className="text-sm text-gray-500">
              {reason.className} - {reason.section} | Roll: {reason.rollNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(reason.severity)}`}
          >
            {reason.severity.toUpperCase()}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reason.status)}`}
          >
            {reason.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div>
          <span className="text-sm font-medium text-gray-700">Reason:</span>
          <p className="text-sm text-gray-600 mt-1">{reason.reason}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Category:</span>
            <div className="font-medium capitalize">{reason.category}</div>
          </div>
          <div>
            <span className="text-gray-500">Disabled By:</span>
            <div className="font-medium">{reason.disabledBy}</div>
          </div>
          <div>
            <span className="text-gray-500">Start Date:</span>
            <div className="font-medium">
              {new Date(reason.startDate).toLocaleDateString()}
            </div>
          </div>
          <div>
            <span className="text-gray-500">End Date:</span>
            <div className="font-medium">
              {reason.endDate
                ? new Date(reason.endDate).toLocaleDateString()
                : 'Indefinite'}
            </div>
          </div>
        </div>

        {reason.endDate && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <span
              className={`${isExpired ? 'text-red-600' : daysRemaining <= 7 ? 'text-yellow-600' : 'text-green-600'}`}
            >
              {isExpired ? 'Expired' : `${daysRemaining} days remaining`}
            </span>
          </div>
        )}

        {reason.affectedAreas && reason.affectedAreas.length > 0 && (
          <div>
            <span className="text-sm text-gray-500">Affected Areas:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {Array.isArray(reason.affectedAreas) &&
                reason.affectedAreas.map((area, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                  >
                    {area}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Created: {new Date(reason.createdAt).toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(reason)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(reason)}
            className="p-1 text-gray-400 hover:text-green-600"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(reason)}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

const DisableReasonDialog = ({ reason, open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    studentId: reason?.studentId || '',
    category: reason?.category || 'academic',
    severity: reason?.severity || 'medium',
    reason: reason?.reason || '',
    startDate: reason?.startDate || new Date().toISOString().split('T')[0],
    endDate: reason?.endDate || '',
    isIndefinite: reason?.isIndefinite || false,
    affectedAreas: reason?.affectedAreas || [],
    additionalNotes: reason?.additionalNotes || '',
    requiresApproval: reason?.requiresApproval || false,
    notifyParents: reason?.notifyParents || true,
  })

  const [selectedStudent, setSelectedStudent] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const { data: studentsData } = useQuery({
    queryKey: ['students', 'search', searchTerm],
    queryFn: () => disableReasonApi.searchStudents(searchTerm),
    enabled: searchTerm.length > 2,
  })

  const handleSave = () => {
    const data = {
      ...formData,
      studentId: selectedStudent?.id,
      endDate: formData.isIndefinite ? null : formData.endDate,
    }
    onSave(reason?.id, data)
    onClose()
  }

  const toggleAffectedArea = area => {
    setFormData(prev => ({
      ...prev,
      affectedAreas: prev.affectedAreas.includes(area)
        ? prev.affectedAreas.filter(a => a !== area)
        : [...prev.affectedAreas, area],
    }))
  }

  const affectedAreaOptions = [
    'Exams',
    'Assignments',
    'Attendance',
    'Library',
    'Sports',
    'Events',
    'Certificates',
    'Reports',
    'Online Portal',
    'Fee Payment',
  ]

  React.useEffect(() => {
    if (reason?.studentId) {
      // In real app, fetch student details
      setSelectedStudent({
        id: reason.studentId,
        name: reason.studentName,
        className: reason.className,
        section: reason.section,
        rollNumber: reason.rollNumber,
      })
    }
  }, [reason])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={reason ? 'Edit Disable Reason' : 'Add Disable Reason'}
      size="xl"
    >
      <div className="space-y-6">
        {/* Student Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Student *</label>
          {selectedStudent ? (
            <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium">{selectedStudent.name}</div>
                  <div className="text-sm text-gray-500">
                    {selectedStudent.className} - {selectedStudent.section} |
                    Roll: {selectedStudent.rollNumber}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search student by name or roll number..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />

              {searchTerm.length > 2 && studentsData?.data && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {Array.isArray(studentsData.data) &&
                    studentsData.data.map(student => (
                      <button
                        key={student.id}
                        onClick={() => {
                          setSelectedStudent(student)
                          setSearchTerm('')
                        }}
                        className="w-full p-3 text-left hover:bg-gray-50 flex items-center gap-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-3 h-3 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {student.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {student.className} - {student.section} | Roll:{' '}
                            {student.rollNumber}
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              value={formData.category}
              onChange={e =>
                setFormData(prev => ({ ...prev, category: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="academic">Academic</option>
              <option value="disciplinary">Disciplinary</option>
              <option value="medical">Medical</option>
              <option value="financial">Financial</option>
              <option value="administrative">Administrative</option>
              <option value="technical">Technical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Severity *</label>
            <select
              value={formData.severity}
              onChange={e =>
                setFormData(prev => ({ ...prev, severity: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex items-center gap-4 mt-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.requiresApproval}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    requiresApproval: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <span className="text-sm">Requires Approval</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.notifyParents}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    notifyParents: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <span className="text-sm">Notify Parents</span>
            </label>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium mb-1">Reason *</label>
          <textarea
            value={formData.reason}
            onChange={e =>
              setFormData(prev => ({ ...prev, reason: e.target.value }))
            }
            rows={3}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Provide detailed reason for disabling the student..."
          />
        </div>

        {/* Duration */}
        <div>
          <h3 className="font-medium mb-3">Duration</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date *"
                type="date"
                value={formData.startDate}
                onChange={e =>
                  setFormData(prev => ({ ...prev, startDate: e.target.value }))
                }
              />
              <Input
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={e =>
                  setFormData(prev => ({ ...prev, endDate: e.target.value }))
                }
                disabled={formData.isIndefinite}
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isIndefinite}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    isIndefinite: e.target.checked,
                    endDate: e.target.checked ? '' : prev.endDate,
                  }))
                }
                className="rounded"
              />
              <span className="text-sm font-medium">Indefinite duration</span>
            </label>
          </div>
        </div>

        {/* Affected Areas */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Affected Areas
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Array.isArray(affectedAreaOptions) &&
              affectedAreaOptions.map(area => (
                <label key={area} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.affectedAreas.includes(area)}
                    onChange={() => toggleAffectedArea(area)}
                    className="rounded"
                  />
                  <span className="text-sm">{area}</span>
                </label>
              ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Additional Notes
          </label>
          <textarea
            value={formData.additionalNotes}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                additionalNotes: e.target.value,
              }))
            }
            rows={3}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Any additional information or special instructions..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedStudent || !formData.reason.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {reason ? 'Update' : 'Create'} Disable Reason
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const DisableReasonDetailsDialog = ({ reason, open, onClose }) => {
  if (!reason) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Disable Reason Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Student Info */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold">{reason.studentName}</h3>
            <p className="text-sm text-gray-600">
              {reason.className} - {reason.section} | Roll: {reason.rollNumber}
            </p>
          </div>
        </div>

        {/* Basic Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <p className="text-sm capitalize">{reason.category}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Severity
            </label>
            <p className="text-sm capitalize">{reason.severity}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <p className="text-sm capitalize">{reason.status}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Disabled By
            </label>
            <p className="text-sm">{reason.disabledBy}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <p className="text-sm">
              {new Date(reason.startDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <p className="text-sm">
              {reason.endDate
                ? new Date(reason.endDate).toLocaleDateString()
                : 'Indefinite'}
            </p>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason
          </label>
          <p className="text-sm bg-gray-50 p-3 rounded">{reason.reason}</p>
        </div>

        {/* Affected Areas */}
        {reason.affectedAreas && reason.affectedAreas.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Affected Areas
            </label>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(reason.affectedAreas) &&
                reason.affectedAreas.map((area, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                  >
                    {area}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Additional Notes */}
        {reason.additionalNotes && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <p className="text-sm bg-gray-50 p-3 rounded">
              {reason.additionalNotes}
            </p>
          </div>
        )}

        {/* Timeline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeline
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>
                Created on {new Date(reason.createdAt).toLocaleDateString()}
              </span>
            </div>
            {reason.updatedAt && reason.updatedAt !== reason.createdAt && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>
                  Last updated on{' '}
                  {new Date(reason.updatedAt).toLocaleDateString()}
                </span>
              </div>
            )}
            {reason.endDate && new Date(reason.endDate) < new Date() && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span>
                  Expired on {new Date(reason.endDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
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

const DisableReason = () => {
  const [selectedReason, setSelectedReason] = useState(null)
  const [showReasonDialog, setShowReasonDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')

  const queryClient = useQueryClient()

  const { data: reasonsData, isLoading } = useQuery({
    queryKey: [
      'disable-reasons',
      searchTerm,
      categoryFilter,
      statusFilter,
      severityFilter,
    ],
    queryFn: () =>
      disableReasonApi.getDisableReasons({
        search: searchTerm,
        category: categoryFilter,
        status: statusFilter,
        severity: severityFilter,
      }),
  })

  const saveReasonMutation = useMutation({
    mutationFn: ({ id, data }) =>
      id
        ? disableReasonApi.updateDisableReason(id, data)
        : disableReasonApi.createDisableReason(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['disable-reasons'])
      setShowReasonDialog(false)
      setSelectedReason(null)
    },
  })

  const deleteReasonMutation = useMutation({
    mutationFn: disableReasonApi.deleteDisableReason,
    onSuccess: () => {
      queryClient.invalidateQueries(['disable-reasons'])
    },
  })

  const handleEditReason = reason => {
    setSelectedReason(reason)
    setShowReasonDialog(true)
  }

  const handleDeleteReason = reason => {
    if (
      confirm(
        `Are you sure you want to delete the disable reason for "${reason.studentName}"?`,
      )
    ) {
      deleteReasonMutation.mutate(reason.id)
    }
  }

  const handleViewDetails = reason => {
    setSelectedReason(reason)
    setShowDetailsDialog(true)
  }

  const handleSaveReason = (id, data) => {
    saveReasonMutation.mutate({ id, data })
  }

  const handleAddReason = () => {
    setSelectedReason(null)
    setShowReasonDialog(true)
  }

  const filteredReasons = reasonsData?.data || []

  const getStatistics = () => {
    const reasons = reasonsData?.data || []
    const now = new Date()

    return {
      total: reasons.length,
      active: reasons.filter(r => r.status === 'active').length,
      expired: reasons.filter(r => r.endDate && new Date(r.endDate) < now)
        .length,
      indefinite: reasons.filter(r => !r.endDate).length,
      expiringSoon: reasons.filter(r => {
        if (!r.endDate) return false
        const daysUntilExpiry = Math.ceil(
          (new Date(r.endDate) - now) / (1000 * 60 * 60 * 24),
        )
        return daysUntilExpiry > 0 && daysUntilExpiry <= 7
      }).length,
    }
  }

  const stats = getStatistics()

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Disable Reasons</h1>
        <button
          onClick={handleAddReason}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Disable Reason
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <UserX className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Disabled</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-gray-600">Currently Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-gray-600" />
            <div>
              <p className="text-2xl font-bold">{stats.expired}</p>
              <p className="text-sm text-gray-600">Expired</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">{stats.expiringSoon}</p>
              <p className="text-sm text-gray-600">Expiring Soon</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{stats.indefinite}</p>
              <p className="text-sm text-gray-600">Indefinite</p>
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
              placeholder="Search students..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Categories</option>
            <option value="academic">Academic</option>
            <option value="disciplinary">Disciplinary</option>
            <option value="medical">Medical</option>
            <option value="financial">Financial</option>
            <option value="administrative">Administrative</option>
            <option value="technical">Technical</option>
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="expired">Expired</option>
          </select>
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Disable Reasons List */}
      <div className="space-y-4">
        {filteredReasons.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <UserX className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Disable Reasons Found
            </h3>
            <p className="text-gray-500 mb-4">
              {reasonsData?.data?.length === 0
                ? 'No students have been disabled yet.'
                : 'No disable reasons match your current filters.'}
            </p>
            {reasonsData?.data?.length === 0 && (
              <button
                onClick={handleAddReason}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Disable Reason
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.isArray(filteredReasons) &&
              filteredReasons.map(reason => (
                <DisableReasonCard
                  key={reason.id}
                  reason={reason}
                  onEdit={handleEditReason}
                  onDelete={handleDeleteReason}
                  onViewDetails={handleViewDetails}
                />
              ))}
          </div>
        )}
      </div>

      {/* Disable Reason Dialog */}
      <DisableReasonDialog
        reason={selectedReason}
        open={showReasonDialog}
        onClose={() => {
          setShowReasonDialog(false)
          setSelectedReason(null)
        }}
        onSave={handleSaveReason}
      />

      {/* Details Dialog */}
      <DisableReasonDetailsDialog
        reason={selectedReason}
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
      />
    </div>
  )
}

export default DisableReason
