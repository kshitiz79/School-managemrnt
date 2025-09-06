import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowRight,
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  Search,
  Download,
  Upload,
  RefreshCw,
  Eye,
  FileText,
  TrendingUp,
  Clock,
  BookOpen,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { feesApi } from '../../lib/api/fees'

const CarryForwardCard = ({
  student,
  onViewDetails,
  onProcessCarryForward,
  onAdjustAmount,
}) => {
  const totalCarryForward =
    student.carryForwardItems?.reduce((sum, item) => sum + item.amount, 0) || 0
  const adjustedAmount = student.adjustedAmount || 0
  const finalAmount = totalCarryForward - adjustedAmount

  const getStatusColor = status => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'processed':
        return 'text-green-600 bg-green-100'
      case 'adjusted':
        return 'text-blue-600 bg-blue-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold">{student.name}</h3>
            <p className="text-sm text-gray-600">
              {student.className} - {student.section} | Roll:{' '}
              {student.rollNumber}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-orange-600">
            ₹{finalAmount.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Carry Forward</div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}
          >
            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Previous Year:</span>
          <div className="font-medium">{student.previousAcademicYear}</div>
        </div>
        <div>
          <span className="text-gray-500">Current Year:</span>
          <div className="font-medium">{student.currentAcademicYear}</div>
        </div>
        <div>
          <span className="text-gray-500">Original Amount:</span>
          <div className="font-medium">
            ₹{totalCarryForward.toLocaleString()}
          </div>
        </div>
        <div>
          <span className="text-gray-500">Adjustments:</span>
          <div className="font-medium text-blue-600">
            {adjustedAmount > 0 ? `-₹${adjustedAmount.toLocaleString()}` : '₹0'}
          </div>
        </div>
      </div>

      {student.carryForwardItems && student.carryForwardItems.length > 0 && (
        <div className="border-t pt-3 mb-4">
          <div className="text-sm text-gray-600 mb-2">Carry Forward Items:</div>
          <div className="space-y-1">
            {student.carryForwardItems.slice(0, 3).map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm"
              >
                <span>
                  {item.feeType} - {item.description}
                </span>
                <span className="font-medium">
                  ₹{item.amount.toLocaleString()}
                </span>
              </div>
            ))}
            {student.carryForwardItems.length > 3 && (
              <div className="text-sm text-gray-500">
                +{student.carryForwardItems.length - 3} more items
              </div>
            )}
          </div>
        </div>
      )}

      {student.remarks && (
        <div className="border-t pt-3 mb-4">
          <div className="text-sm text-gray-600 mb-1">Remarks:</div>
          <div className="text-sm bg-gray-50 p-2 rounded">
            {student.remarks}
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
          {student.status === 'pending' && (
            <>
              <button
                onClick={() => onAdjustAmount(student)}
                className="p-1 text-gray-400 hover:text-yellow-600"
                title="Adjust Amount"
              >
                <DollarSign className="w-4 h-4" />
              </button>
              <button
                onClick={() => onProcessCarryForward(student)}
                className="p-1 text-gray-400 hover:text-green-600"
                title="Process Carry Forward"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const CarryForwardDetailsDialog = ({ student, open, onClose }) => {
  if (!student) return null

  const totalCarryForward =
    student.carryForwardItems?.reduce((sum, item) => sum + item.amount, 0) || 0
  const adjustedAmount = student.adjustedAmount || 0
  const finalAmount = totalCarryForward - adjustedAmount

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Carry Forward Details - ${student.name}`}
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
              <span className="text-gray-500">Previous Class:</span>
              <div className="font-medium">{student.previousClass}</div>
            </div>
            <div>
              <span className="text-gray-500">Current Class:</span>
              <div className="font-medium">
                {student.className} - {student.section}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Previous Year:</span>
              <div className="font-medium">{student.previousAcademicYear}</div>
            </div>
            <div>
              <span className="text-gray-500">Current Year:</span>
              <div className="font-medium">{student.currentAcademicYear}</div>
            </div>
          </div>
        </div>

        {/* Carry Forward Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              ₹{totalCarryForward.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Original Amount</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              ₹{adjustedAmount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Adjustments</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              ₹{finalAmount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Final Amount</div>
          </div>
        </div>

        {/* Carry Forward Items */}
        <div>
          <h3 className="font-medium mb-3">Carry Forward Items</h3>
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">Fee Type</th>
                  <th className="text-left py-3 px-4">Description</th>
                  <th className="text-left py-3 px-4">Due Date</th>
                  <th className="text-right py-3 px-4">Amount</th>
                  <th className="text-center py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {student.carryForwardItems?.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{item.feeType}</td>
                    <td className="py-3 px-4">{item.description}</td>
                    <td className="py-3 px-4">
                      {new Date(item.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      ₹{item.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                        Pending
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="3" className="py-3 px-4 font-bold text-right">
                    Total:
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-lg">
                    ₹{totalCarryForward.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Adjustment History */}
        {student.adjustmentHistory && student.adjustmentHistory.length > 0 && (
          <div>
            <h3 className="font-medium mb-3">Adjustment History</h3>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-2 px-4">Date</th>
                    <th className="text-left py-2 px-4">Type</th>
                    <th className="text-right py-2 px-4">Amount</th>
                    <th className="text-left py-2 px-4">Reason</th>
                    <th className="text-left py-2 px-4">By</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(student.adjustmentHistory) &&
                    student.adjustmentHistory.map((adjustment, index) => (
                      <tr key={index} className="border-b text-sm">
                        <td className="py-2 px-4">
                          {new Date(adjustment.date).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-4 capitalize">
                          {adjustment.type}
                        </td>
                        <td className="py-2 px-4 text-right">
                          ₹{adjustment.amount.toLocaleString()}
                        </td>
                        <td className="py-2 px-4">{adjustment.reason}</td>
                        <td className="py-2 px-4">{adjustment.adjustedBy}</td>
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

const AdjustAmountDialog = ({ student, open, onClose, onAdjust }) => {
  const [adjustmentType, setAdjustmentType] = useState('waiver')
  const [adjustmentAmount, setAdjustmentAmount] = useState(0)
  const [adjustmentReason, setAdjustmentReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAdjust = async () => {
    if (!adjustmentAmount || !adjustmentReason.trim()) {
      alert('Please enter adjustment amount and reason')
      return
    }

    setIsProcessing(true)
    try {
      await onAdjust(student.id, {
        type: adjustmentType,
        amount: adjustmentAmount,
        reason: adjustmentReason,
      })
      onClose()
      setAdjustmentAmount(0)
      setAdjustmentReason('')
    } catch (error) {
      console.error('Adjustment error:', error)
      alert('Error processing adjustment. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!student) return null

  const totalCarryForward =
    student.carryForwardItems?.reduce((sum, item) => sum + item.amount, 0) || 0
  const currentAdjustment = student.adjustedAmount || 0
  const maxAdjustment = totalCarryForward - currentAdjustment

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Adjust Carry Forward - ${student.name}`}
      size="lg"
    >
      <div className="space-y-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium mb-2">Current Status</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Original Amount:</span>
              <div className="font-medium">
                ₹{totalCarryForward.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Current Adjustments:</span>
              <div className="font-medium">
                ₹{currentAdjustment.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Remaining:</span>
              <div className="font-medium">
                ₹{maxAdjustment.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Adjustment Type
            </label>
            <select
              value={adjustmentType}
              onChange={e => setAdjustmentType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="waiver">Fee Waiver</option>
              <option value="discount">Discount</option>
              <option value="scholarship">Scholarship</option>
              <option value="correction">Correction</option>
              <option value="other">Other</option>
            </select>
          </div>
          <Input
            label="Adjustment Amount"
            type="number"
            value={adjustmentAmount}
            onChange={e => setAdjustmentAmount(parseFloat(e.target.value) || 0)}
            min="0"
            max={maxAdjustment}
            placeholder="Enter amount"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Reason for Adjustment *
          </label>
          <textarea
            value={adjustmentReason}
            onChange={e => setAdjustmentReason(e.target.value)}
            rows={3}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Provide detailed reason for this adjustment..."
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Note:</strong> This adjustment will reduce the carry
              forward amount. Final amount after adjustment: ₹
              {(maxAdjustment - adjustmentAmount).toLocaleString()}
            </div>
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
            onClick={handleAdjust}
            disabled={
              isProcessing || !adjustmentAmount || !adjustmentReason.trim()
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {isProcessing ? 'Processing...' : 'Apply Adjustment'}
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const BulkProcessDialog = ({
  selectedStudents,
  open,
  onClose,
  onBulkProcess,
}) => {
  const [processType, setProcessType] = useState('carry_forward')
  const [targetAcademicYear, setTargetAcademicYear] = useState('2024-25')
  const [applyDiscount, setApplyDiscount] = useState(false)
  const [discountPercentage, setDiscountPercentage] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const totalAmount = Array.isArray(selectedStudents)
    ? selectedStudents.reduce((sum, student) => {
        const carryForwardAmount =
          student.carryForwardItems?.reduce(
            (itemSum, item) => itemSum + item.amount,
            0,
          ) || 0
        const adjustedAmount = student.adjustedAmount || 0
        return sum + (carryForwardAmount - adjustedAmount)
      }, 0)
    : 0

  const discountAmount = applyDiscount
    ? (totalAmount * discountPercentage) / 100
    : 0
  const finalAmount = totalAmount - discountAmount

  const handleBulkProcess = async () => {
    setIsProcessing(true)
    try {
      await onBulkProcess({
        studentIds: selectedStudents.map(s => s.id),
        processType,
        targetAcademicYear,
        applyDiscount,
        discountPercentage,
      })
      onClose()
    } catch (error) {
      console.error('Bulk process error:', error)
      alert('Error processing bulk operation. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Bulk Process Carry Forward"
      size="lg"
    >
      <div className="space-y-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium mb-2">Selected Students</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Students:</span>
              <div className="font-medium">{selectedStudents.length}</div>
            </div>
            <div>
              <span className="text-gray-600">Total Amount:</span>
              <div className="font-medium">₹{totalAmount.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-gray-600">Final Amount:</span>
              <div className="font-medium text-green-600">
                ₹{finalAmount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Process Type
            </label>
            <select
              value={processType}
              onChange={e => setProcessType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="carry_forward">Carry Forward to Next Year</option>
              <option value="write_off">Write Off Amount</option>
              <option value="convert_to_dues">
                Convert to Current Year Dues
              </option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Target Academic Year
            </label>
            <select
              value={targetAcademicYear}
              onChange={e => setTargetAcademicYear(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="2024-25">2024-25</option>
              <option value="2025-26">2025-26</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={applyDiscount}
              onChange={e => setApplyDiscount(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm font-medium">Apply bulk discount</span>
          </label>

          {applyDiscount && (
            <div className="ml-6">
              <Input
                label="Discount Percentage"
                type="number"
                value={discountPercentage}
                onChange={e =>
                  setDiscountPercentage(parseFloat(e.target.value) || 0)
                }
                min="0"
                max="100"
                placeholder="Enter discount percentage"
              />
              <div className="text-sm text-gray-600 mt-1">
                Discount Amount: ₹{discountAmount.toLocaleString()}
              </div>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Warning:</strong> This action will process carry forward
              for {selectedStudents.length} students. This operation cannot be
              undone. Please review carefully before proceeding.
            </div>
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
            onClick={handleBulkProcess}
            disabled={isProcessing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            {isProcessing
              ? 'Processing...'
              : `Process ${selectedStudents.length} Students`}
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const FeesCarryForward = () => {
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedStudents, setSelectedStudents] = useState([])
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showAdjustDialog, setShowAdjustDialog] = useState(false)
  const [showBulkProcessDialog, setShowBulkProcessDialog] = useState(false)
  const [filters, setFilters] = useState({
    searchTerm: '',
    academicYear: '2023-24',
    status: 'all',
    classId: '',
    amountFrom: '',
    amountTo: '',
  })

  const queryClient = useQueryClient()

  const {
    data: carryForwardData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['carry-forward', 'students', filters],
    queryFn: () => feesApi.getCarryForwardStudents(filters),
  })

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => feesApi.getClasses(),
  })

  const adjustAmountMutation = useMutation({
    mutationFn: ({ studentId, adjustmentData }) =>
      feesApi.adjustCarryForwardAmount(studentId, adjustmentData),
    onSuccess: () => {
      queryClient.invalidateQueries(['carry-forward'])
      setShowAdjustDialog(false)
    },
  })

  const processCarryForwardMutation = useMutation({
    mutationFn: studentId => feesApi.processCarryForward(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['carry-forward'])
    },
  })

  const bulkProcessMutation = useMutation({
    mutationFn: bulkData => feesApi.bulkProcessCarryForward(bulkData),
    onSuccess: () => {
      queryClient.invalidateQueries(['carry-forward'])
      setSelectedStudents([])
      setShowBulkProcessDialog(false)
    },
  })

  const handleViewDetails = student => {
    setSelectedStudent(student)
    setShowDetailsDialog(true)
  }

  const handleAdjustAmount = student => {
    setSelectedStudent(student)
    setShowAdjustDialog(true)
  }

  const handleProcessCarryForward = async student => {
    if (
      confirm(
        `Process carry forward for ${student.name}? This action cannot be undone.`,
      )
    ) {
      processCarryForwardMutation.mutate(student.id)
    }
  }

  const handleAdjustAmountSubmit = (studentId, adjustmentData) => {
    adjustAmountMutation.mutate({ studentId, adjustmentData })
  }

  const handleBulkProcess = bulkData => {
    bulkProcessMutation.mutate(bulkData)
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
    if (selectedStudents.length === carryForwardData?.data?.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(carryForwardData?.data || [])
    }
  }

  const handleExportData = async () => {
    try {
      const exportData = carryForwardData?.data || []
      const csvContent = generateCSVContent(exportData)
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `carry-forward-${filters.academicYear}.csv`
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
      'Previous Class',
      'Current Class',
      'Previous Year',
      'Current Year',
      'Original Amount',
      'Adjusted Amount',
      'Final Amount',
      'Status',
    ]

    const rows = data.map(student => {
      const totalCarryForward =
        student.carryForwardItems?.reduce(
          (sum, item) => sum + item.amount,
          0,
        ) || 0
      const adjustedAmount = student.adjustedAmount || 0
      const finalAmount = totalCarryForward - adjustedAmount

      return [
        student.name,
        student.rollNumber,
        student.previousClass,
        `${student.className} - ${student.section}`,
        student.previousAcademicYear,
        student.currentAcademicYear,
        totalCarryForward,
        adjustedAmount,
        finalAmount,
        student.status,
      ]
    })

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  const getStatistics = () => {
    const students = carryForwardData?.data || []
    const totalAmount = Array.isArray(students)
      ? students.reduce((sum, student) => {
          const carryForwardAmount =
            student.carryForwardItems?.reduce(
              (itemSum, item) => itemSum + item.amount,
              0,
            ) || 0
          const adjustedAmount = student.adjustedAmount || 0
          return sum + (carryForwardAmount - adjustedAmount)
        }, 0)
      : 0

    return {
      totalStudents: students.length,
      pendingStudents: students.filter(s => s.status === 'pending').length,
      processedStudents: students.filter(s => s.status === 'processed').length,
      totalAmount,
    }
  }

  const stats = getStatistics()

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fees Carry Forward</h1>
        <div className="flex gap-2">
          {selectedStudents.length > 0 && (
            <button
              onClick={() => setShowBulkProcessDialog(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Bulk Process ({selectedStudents.length})
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
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
              <p className="text-sm text-gray-600">Total Students</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">{stats.pendingStudents}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{stats.processedStudents}</p>
              <p className="text-sm text-gray-600">Processed</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold">
                ₹{stats.totalAmount.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Amount</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search students..."
              value={filters.searchTerm}
              onChange={e =>
                setFilters(prev => ({ ...prev, searchTerm: e.target.value }))
              }
              className="pl-10 pr-4 py-2 border rounded-lg w-full"
            />
          </div>
          <select
            value={filters.academicYear}
            onChange={e =>
              setFilters(prev => ({ ...prev, academicYear: e.target.value }))
            }
            className="border rounded-lg px-3 py-2"
          >
            <option value="2023-24">2023-24</option>
            <option value="2022-23">2022-23</option>
            <option value="2021-22">2021-22</option>
          </select>
          <select
            value={filters.status}
            onChange={e =>
              setFilters(prev => ({ ...prev, status: e.target.value }))
            }
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processed">Processed</option>
            <option value="adjusted">Adjusted</option>
          </select>
          <select
            value={filters.classId}
            onChange={e =>
              setFilters(prev => ({ ...prev, classId: e.target.value }))
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
          <input
            type="number"
            placeholder="Min Amount"
            value={filters.amountFrom}
            onChange={e =>
              setFilters(prev => ({ ...prev, amountFrom: e.target.value }))
            }
            className="border rounded-lg px-3 py-2"
          />
          <input
            type="number"
            placeholder="Max Amount"
            value={filters.amountTo}
            onChange={e =>
              setFilters(prev => ({ ...prev, amountTo: e.target.value }))
            }
            className="border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {/* Selection Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={
                  selectedStudents.length === carryForwardData?.data?.length &&
                  carryForwardData?.data?.length > 0
                }
                onChange={selectAllStudents}
                className="rounded"
              />
              <span className="text-sm font-medium">Select All</span>
            </label>
            <span className="text-sm text-gray-500">
              {selectedStudents.length} of {carryForwardData?.data?.length || 0}{' '}
              selected
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Showing {carryForwardData?.data?.length || 0} students with carry
            forward amounts
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-4">
        {carryForwardData?.data?.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Carry Forward Records
            </h3>
            <p className="text-gray-500">
              No students have pending carry forward amounts for the selected
              criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {carryForwardData?.data?.map(student => (
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
                <CarryForwardCard
                  student={student}
                  onViewDetails={handleViewDetails}
                  onProcessCarryForward={handleProcessCarryForward}
                  onAdjustAmount={handleAdjustAmount}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CarryForwardDetailsDialog
        student={selectedStudent}
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
      />

      <AdjustAmountDialog
        student={selectedStudent}
        open={showAdjustDialog}
        onClose={() => setShowAdjustDialog(false)}
        onAdjust={handleAdjustAmountSubmit}
      />

      <BulkProcessDialog
        selectedStudents={selectedStudents}
        open={showBulkProcessDialog}
        onClose={() => setShowBulkProcessDialog(false)}
        onBulkProcess={handleBulkProcess}
      />
    </div>
  )
}

export default FeesCarryForward
