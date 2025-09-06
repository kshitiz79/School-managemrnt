import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  AlertTriangle,
  Clock,
  DollarSign,
  User,
  Users,
  FileText,
  Mail,
  Phone,
  Printer,
  RefreshCw,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { feesApi } from '../../lib/api/fees'
import { printToPDF } from '../../lib/print'

const DueFeesFilters = ({ filters, onFiltersChange }) => {
  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => feesApi.getClasses(),
  })

  const { data: feeGroupsData } = useQuery({
    queryKey: ['fee-groups', 'active'],
    queryFn: () => feesApi.getActiveFeeGroups(),
  })

  const overdueOptions = [
    { value: 'all', label: 'All Dues' },
    { value: 'overdue', label: 'Overdue Only' },
    { value: 'due_today', label: 'Due Today' },
    { value: 'upcoming', label: 'Upcoming' },
  ]

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Search Filters</h3>
        <button
          onClick={() =>
            onFiltersChange({
              searchTerm: '',
              classId: '',
              feeGroupId: '',
              overdueFilter: 'all',
              dueDateFrom: '',
              dueDateTo: '',
              amountFrom: '',
              amountTo: '',
            })
          }
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Term */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, roll number..."
            value={filters.searchTerm}
            onChange={e =>
              onFiltersChange({ ...filters, searchTerm: e.target.value })
            }
            className="pl-10 pr-4 py-2 border rounded-lg w-full"
          />
        </div>

        {/* Class Filter */}
        <select
          value={filters.classId}
          onChange={e =>
            onFiltersChange({ ...filters, classId: e.target.value })
          }
          className="border rounded-lg px-3 py-2"
        >
          <option value="">All Classes</option>
          {Array.isArray(classesData?.data) &&
            classesData.data.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
        </select>

        {/* Fee Group Filter */}
        <select
          value={filters.feeGroupId}
          onChange={e =>
            onFiltersChange({ ...filters, feeGroupId: e.target.value })
          }
          className="border rounded-lg px-3 py-2"
        >
          <option value="">All Fee Groups</option>
          {feeGroupsData?.data?.map(group => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>

        {/* Overdue Filter */}
        <select
          value={filters.overdueFilter}
          onChange={e =>
            onFiltersChange({ ...filters, overdueFilter: e.target.value })
          }
          className="border rounded-lg px-3 py-2"
        >
          {Array.isArray(overdueOptions) &&
            overdueOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
        </select>

        {/* Due Date Range */}
        <Input
          label="Due From"
          type="date"
          value={filters.dueDateFrom}
          onChange={e =>
            onFiltersChange({ ...filters, dueDateFrom: e.target.value })
          }
        />

        <Input
          label="Due To"
          type="date"
          value={filters.dueDateTo}
          onChange={e =>
            onFiltersChange({ ...filters, dueDateTo: e.target.value })
          }
        />

        {/* Amount Range */}
        <Input
          label="Min Amount"
          type="number"
          value={filters.amountFrom}
          onChange={e =>
            onFiltersChange({ ...filters, amountFrom: e.target.value })
          }
          placeholder="0"
        />

        <Input
          label="Max Amount"
          type="number"
          value={filters.amountTo}
          onChange={e =>
            onFiltersChange({ ...filters, amountTo: e.target.value })
          }
          placeholder="No limit"
        />
      </div>
    </div>
  )
}

const DueFeesCard = ({
  student,
  onViewDetails,
  onSendReminder,
  onCollectFees,
}) => {
  const totalDue =
    student.dueFees?.reduce((sum, fee) => sum + fee.dueAmount, 0) || 0
  const overdueAmount =
    student.dueFees?.reduce(
      (sum, fee) => sum + (fee.isOverdue ? fee.dueAmount : 0),
      0,
    ) || 0
  const overdueCount = student.dueFees?.filter(fee => fee.isOverdue).length || 0

  const getUrgencyColor = () => {
    if (overdueAmount > 0) return 'border-red-500 bg-red-50'
    if (student.dueFees?.some(fee => fee.isDueToday))
      return 'border-yellow-500 bg-yellow-50'
    return 'border-gray-200 bg-white'
  }

  const getUrgencyIcon = () => {
    if (overdueAmount > 0)
      return <AlertTriangle className="w-5 h-5 text-red-600" />
    if (student.dueFees?.some(fee => fee.isDueToday))
      return <Clock className="w-5 h-5 text-yellow-600" />
    return <Calendar className="w-5 h-5 text-blue-600" />
  }

  return (
    <div
      className={`border rounded-lg p-6 hover:shadow-md transition-shadow ${getUrgencyColor()}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold">{student.name}</h3>
            <p className="text-sm text-gray-600">
              {student.className} - {student.section} | Roll:{' '}
              {student.rollNumber}
            </p>
            <p className="text-sm text-gray-500">
              Admission: {student.admissionNumber}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 mb-1">{getUrgencyIcon()}</div>
          <div className="text-xl font-bold text-red-600">
            ₹{totalDue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Total Due</div>
          {overdueAmount > 0 && (
            <div className="text-sm text-red-600 font-medium">
              ₹{overdueAmount.toLocaleString()} Overdue
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Father's Name:</span>
          <div className="font-medium">{student.fatherName}</div>
        </div>
        <div>
          <span className="text-gray-500">Contact:</span>
          <div className="font-medium">{student.contactNumber}</div>
        </div>
        <div>
          <span className="text-gray-500">Pending Fees:</span>
          <div className="font-medium">
            {student.dueFees?.length || 0} items
          </div>
        </div>
        <div>
          <span className="text-gray-500">Last Payment:</span>
          <div className="font-medium">
            {student.lastPaymentDate
              ? new Date(student.lastPaymentDate).toLocaleDateString()
              : 'Never'}
          </div>
        </div>
      </div>

      {student.dueFees && student.dueFees.length > 0 && (
        <div className="border-t pt-3 mb-4">
          <div className="text-sm text-gray-600 mb-2">Due Fees:</div>
          <div className="space-y-1">
            {student.dueFees.slice(0, 3).map((fee, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm"
              >
                <span
                  className={
                    fee.isOverdue
                      ? 'text-red-600'
                      : fee.isDueToday
                        ? 'text-yellow-600'
                        : ''
                  }
                >
                  {fee.feeTypeName} - {fee.installmentName}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    ₹{fee.dueAmount.toLocaleString()}
                  </span>
                  {fee.isOverdue && (
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                  )}
                  {fee.isDueToday && (
                    <Clock className="w-3 h-3 text-yellow-500" />
                  )}
                </div>
              </div>
            ))}
            {student.dueFees.length > 3 && (
              <div className="text-sm text-gray-500">
                +{student.dueFees.length - 3} more fees
              </div>
            )}
          </div>
        </div>
      )}

      {overdueCount > 0 && (
        <div className="bg-red-100 border border-red-200 rounded p-2 mb-4">
          <div className="flex items-center gap-2 text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">
              {overdueCount} overdue payment(s)
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Last updated: {new Date(student.updatedAt).toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(student)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSendReminder(student)}
            className="p-1 text-gray-400 hover:text-yellow-600"
            title="Send Reminder"
          >
            <Mail className="w-4 h-4" />
          </button>
          <button
            onClick={() => onCollectFees(student)}
            className="p-1 text-gray-400 hover:text-green-600"
            title="Collect Fees"
          >
            <DollarSign className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

const StudentDueDetailsDialog = ({ student, open, onClose }) => {
  if (!student) return null

  const totalDue =
    student.dueFees?.reduce((sum, fee) => sum + fee.dueAmount, 0) || 0
  const overdueAmount =
    student.dueFees?.reduce(
      (sum, fee) => sum + (fee.isOverdue ? fee.dueAmount : 0),
      0,
    ) || 0

  const getStatusColor = fee => {
    if (fee.isOverdue) return 'text-red-600 bg-red-100'
    if (fee.isDueToday) return 'text-yellow-600 bg-yellow-100'
    return 'text-blue-600 bg-blue-100'
  }

  const getStatusText = fee => {
    if (fee.isOverdue) return 'Overdue'
    if (fee.isDueToday) return 'Due Today'
    return 'Upcoming'
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Due Fees - ${student.name}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Student Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium mb-3">Student Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Name:</span>
              <div className="font-medium">{student.name}</div>
            </div>
            <div>
              <span className="text-gray-500">Roll Number:</span>
              <div className="font-medium">{student.rollNumber}</div>
            </div>
            <div>
              <span className="text-gray-500">Class:</span>
              <div className="font-medium">
                {student.className} - {student.section}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Admission Number:</span>
              <div className="font-medium">{student.admissionNumber}</div>
            </div>
            <div>
              <span className="text-gray-500">Father's Name:</span>
              <div className="font-medium">{student.fatherName}</div>
            </div>
            <div>
              <span className="text-gray-500">Contact Number:</span>
              <div className="font-medium">{student.contactNumber}</div>
            </div>
          </div>
        </div>

        {/* Due Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              ₹{totalDue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Due</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              ₹{overdueAmount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Overdue Amount</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {student.dueFees?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Pending Items</div>
          </div>
        </div>

        {/* Due Fees Table */}
        <div>
          <h3 className="font-medium mb-3">Due Fees Details</h3>
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">Fee Type</th>
                  <th className="text-left py-3 px-4">Due Date</th>
                  <th className="text-right py-3 px-4">Amount</th>
                  <th className="text-right py-3 px-4">Late Fee</th>
                  <th className="text-right py-3 px-4">Total Due</th>
                  <th className="text-center py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {student.dueFees?.map((fee, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{fee.feeTypeName}</div>
                      <div className="text-sm text-gray-500">
                        {fee.installmentName}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      ₹{fee.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {fee.lateFee > 0
                        ? `₹${fee.lateFee.toLocaleString()}`
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      ₹{fee.dueAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(fee)}`}
                      >
                        {getStatusText(fee)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="4" className="py-3 px-4 font-bold text-right">
                    Total Due Amount:
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-lg">
                    ₹{totalDue.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Payment History */}
        {student.paymentHistory && student.paymentHistory.length > 0 && (
          <div>
            <h3 className="font-medium mb-3">Recent Payment History</h3>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-2 px-4">Date</th>
                    <th className="text-left py-2 px-4">Receipt No</th>
                    <th className="text-left py-2 px-4">Fee Type</th>
                    <th className="text-right py-2 px-4">Amount</th>
                    <th className="text-left py-2 px-4">Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {student.paymentHistory.slice(0, 5).map((payment, index) => (
                    <tr key={index} className="border-b text-sm">
                      <td className="py-2 px-4">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4">{payment.receiptNumber}</td>
                      <td className="py-2 px-4">{payment.feeType}</td>
                      <td className="py-2 px-4 text-right">
                        ₹{payment.amount.toLocaleString()}
                      </td>
                      <td className="py-2 px-4 capitalize">
                        {payment.mode.replace('_', ' ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
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

const BulkReminderDialog = ({
  selectedStudents,
  open,
  onClose,
  onSendReminders,
}) => {
  const [reminderType, setReminderType] = useState('sms')
  const [customMessage, setCustomMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const defaultMessages = {
    sms: 'Dear Parent, your ward has pending fee payment of ₹{amount}. Due date: {dueDate}. Please pay at the earliest. - School Management',
    email:
      'Dear Parent,\n\nThis is to remind you that your ward {studentName} (Roll: {rollNumber}) has pending fee payments.\n\nTotal Due Amount: ₹{amount}\nDue Date: {dueDate}\n\nPlease make the payment at the earliest to avoid late fees.\n\nThank you,\nSchool Management',
  }

  const handleSendReminders = async () => {
    setIsSending(true)
    try {
      await onSendReminders({
        studentIds: selectedStudents.map(s => s.id),
        reminderType,
        message: customMessage || defaultMessages[reminderType],
      })
      onClose()
    } catch (error) {
      console.error('Error sending reminders:', error)
      alert('Error sending reminders. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Send Bulk Reminders" size="lg">
      <div className="space-y-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium mb-2">Selected Students</h3>
          <p className="text-sm text-gray-600">
            Sending reminders to {selectedStudents.length} students with total
            due amount of ₹
            {Array.isArray(selectedStudents)
              ? selectedStudents
                  .reduce(
                    (sum, student) =>
                      sum +
                      (student.dueFees?.reduce(
                        (feeSum, fee) => feeSum + fee.dueAmount,
                        0,
                      ) || 0),
                    0
                  )
                  .toLocaleString()
              : '0'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Reminder Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="sms"
                checked={reminderType === 'sms'}
                onChange={e => setReminderType(e.target.value)}
                className="rounded"
              />
              <span>SMS</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="email"
                checked={reminderType === 'email'}
                onChange={e => setReminderType(e.target.value)}
                className="rounded"
              />
              <span>Email</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Message Template
          </label>
          <textarea
            value={customMessage || defaultMessages[reminderType]}
            onChange={e => setCustomMessage(e.target.value)}
            rows={6}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Enter custom message or use default template"
          />
          <div className="text-xs text-gray-500 mt-1">
            Available placeholders: {'{studentName}'}, {'{rollNumber}'},{' '}
            {'{amount}'}, {'{dueDate}'}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSendReminders}
            disabled={isSending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isSending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            {isSending
              ? 'Sending...'
              : `Send ${selectedStudents.length} Reminders`}
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const SearchDueFees = () => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    classId: '',
    feeGroupId: '',
    overdueFilter: 'all',
    dueDateFrom: '',
    dueDateTo: '',
    amountFrom: '',
    amountTo: '',
  })
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState([])
  const [showBulkReminderDialog, setShowBulkReminderDialog] = useState(false)
  const [sortBy, setSortBy] = useState('totalDue')
  const [sortOrder, setSortOrder] = useState('desc')

  const {
    data: dueFeesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['due-fees', 'search', filters, sortBy, sortOrder],
    queryFn: () => feesApi.searchDueFees({ ...filters, sortBy, sortOrder }),
  })

  const handleViewDetails = student => {
    setSelectedStudent(student)
    setShowDetailsDialog(true)
  }

  const handleSendReminder = async student => {
    try {
      await feesApi.sendFeeReminder(student.id)
      alert('Reminder sent successfully!')
    } catch (error) {
      console.error('Error sending reminder:', error)
      alert('Error sending reminder. Please try again.')
    }
  }

  const handleCollectFees = student => {
    // Navigate to collect fees page with student pre-selected
    window.location.href = `/fees/collect?studentId=${student.id}`
  }

  const handleBulkReminders = async reminderData => {
    try {
      await feesApi.sendBulkReminders(reminderData)
      alert('Bulk reminders sent successfully!')
      setSelectedStudents([])
    } catch (error) {
      console.error('Error sending bulk reminders:', error)
      throw error
    }
  }

  const handleExportData = async () => {
    try {
      const exportData = dueFeesData?.data || []
      const csvContent = generateCSVContent(exportData)
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `due-fees-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      alert('Error exporting data. Please try again.')
    }
  }

  const generateCSVContent = data => {
    const headers = [
      'Student Name',
      'Roll Number',
      'Class',
      'Father Name',
      'Contact Number',
      'Total Due',
      'Overdue Amount',
      'Pending Items',
      'Last Payment Date',
    ]

    const rows = data.map(student => [
      student.name,
      student.rollNumber,
      `${student.className} - ${student.section}`,
      student.fatherName,
      student.contactNumber,
      student.dueFees?.reduce((sum, fee) => sum + fee.dueAmount, 0) || 0,
      student.dueFees?.reduce(
        (sum, fee) => sum + (fee.isOverdue ? fee.dueAmount : 0),
        0,
      ) || 0,
      student.dueFees?.length || 0,
      student.lastPaymentDate
        ? new Date(student.lastPaymentDate).toLocaleDateString()
        : 'Never',
    ])

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  const toggleStudentSelection = student => {
    setSelectedStudents(prev => {
      const isSelected = prev.find(s => s.id === student.id)
      if (isSelected) {
        return prev.filter(s => s.id !== student.id)
      } else {
        return [...prev, student]
      }
    })
  }

  const selectAllStudents = () => {
    if (selectedStudents.length === dueFeesData?.data?.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(dueFeesData?.data || [])
    }
  }

  const getStatistics = () => {
    const students = dueFeesData?.data || []
    const totalDue = Array.isArray(students)
      ? students.reduce(
          (sum, student) =>
            sum +
            (student.dueFees?.reduce(
              (feeSum, fee) => feeSum + fee.dueAmount,
              0,
            ) || 0),
          0,
        )
      : 0
    const overdueAmount = Array.isArray(students)
      ? students.reduce(
          (sum, student) =>
            sum +
            (student.dueFees?.reduce(
              (feeSum, fee) => feeSum + (fee.isOverdue ? fee.dueAmount : 0),
              0,
            ) || 0),
          0,
        )
      : 0
    const overdueStudents = students.filter(student =>
      student.dueFees?.some(fee => fee.isOverdue),
    ).length

    return {
      totalStudents: students.length,
      totalDue,
      overdueAmount,
      overdueStudents,
    }
  }

  const stats = getStatistics()

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Search Due Fees</h1>
        <div className="flex gap-2">
          {selectedStudents.length > 0 && (
            <button
              onClick={() => setShowBulkReminderDialog(true)}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Send Reminders ({selectedStudents.length})
            </button>
          )}
          <button
            onClick={() => refetch()}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleExportData}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.totalStudents}</p>
              <p className="text-sm text-gray-600">Students with Dues</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold">
                ₹{stats.totalDue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Due Amount</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">
                ₹{stats.overdueAmount.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Overdue Amount</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold">{stats.overdueStudents}</p>
              <p className="text-sm text-gray-600">Overdue Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <DueFeesFilters filters={filters} onFiltersChange={setFilters} />

      {/* Sort and Selection Options */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={
                  selectedStudents.length === dueFeesData?.data?.length &&
                  dueFeesData?.data?.length > 0
                }
                onChange={selectAllStudents}
                className="rounded"
              />
              <span className="text-sm font-medium">Select All</span>
            </label>
            <span className="text-sm text-gray-500">
              {selectedStudents.length} of {dueFeesData?.data?.length || 0}{' '}
              selected
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="totalDue">Total Due Amount</option>
              <option value="overdueAmount">Overdue Amount</option>
              <option value="studentName">Student Name</option>
              <option value="className">Class</option>
            </select>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Due Fees List */}
      <div className="space-y-4">
        {dueFeesData?.data?.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Due Fees Found
            </h3>
            <p className="text-gray-500">
              No students have pending fee payments matching your search
              criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dueFeesData?.data?.map(student => (
              <div key={student.id} className="relative">
                <label className="absolute top-4 left-4 z-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedStudents.find(s => s.id === student.id) !==
                      undefined
                    }
                    onChange={() => toggleStudentSelection(student)}
                    className="rounded"
                  />
                </label>
                <DueFeesCard
                  student={student}
                  onViewDetails={handleViewDetails}
                  onSendReminder={handleSendReminder}
                  onCollectFees={handleCollectFees}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student Due Details Dialog */}
      <StudentDueDetailsDialog
        student={selectedStudent}
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
      />

      {/* Bulk Reminder Dialog */}
      <BulkReminderDialog
        selectedStudents={selectedStudents}
        open={showBulkReminderDialog}
        onClose={() => setShowBulkReminderDialog(false)}
        onSendReminders={handleBulkReminders}
      />
    </div>
  )
}

export default SearchDueFees
