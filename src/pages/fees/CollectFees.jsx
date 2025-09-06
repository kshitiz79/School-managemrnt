import React, { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  CreditCard,
  Banknote,
  Smartphone,
  Receipt,
  Calculator,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Printer,
  Save,
  RefreshCw,
  Clock,
  Percent,
  Plus,
  Minus,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { feesApi } from '../../lib/api/fees'
import { printToPDF } from '../../lib/print'

const StudentSearchBar = ({ onStudentSelect, selectedStudent }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef(null)

  const { data: studentsData } = useQuery({
    queryKey: ['students', 'search', searchTerm],
    queryFn: () => feesApi.searchStudents(searchTerm),
    enabled: searchTerm.length >= 2,
  })

  useEffect(() => {
    if (studentsData?.data) {
      setSearchResults(studentsData.data)
      setIsSearching(false)
    }
  }, [studentsData])

  const handleSearch = value => {
    setSearchTerm(value)
    if (value.length >= 2) {
      setIsSearching(true)
    } else {
      setSearchResults([])
      setIsSearching(false)
    }
  }

  const handleStudentSelect = student => {
    onStudentSelect(student)
    setSearchTerm(student.name)
    setSearchResults([])
  }

  const clearSearch = () => {
    setSearchTerm('')
    setSearchResults([])
    onStudentSelect(null)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={searchRef}
          type="text"
          placeholder="Search by name, roll number, or admission number..."
          value={searchTerm}
          onChange={e => handleSearch(e.target.value)}
          className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
          autoFocus
        />
        {selectedStudent && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {Array.isArray(searchResults) &&
            searchResults.map(student => (
              <div
                key={student.id}
                onClick={() => handleStudentSelect(student)}
                className="p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-gray-500">
                      Roll: {student.rollNumber} | Class: {student.className} -{' '}
                      {student.section}
                    </div>
                    <div className="text-sm text-gray-500">
                      Admission: {student.admissionNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-red-600">
                      Due: ₹{student.totalDue?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      {student.pendingInstallments || 0} pending
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {isSearching && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
          <div className="text-sm text-gray-600">Searching...</div>
        </div>
      )}
    </div>
  )
}

const StudentInfoCard = ({ student, feeDetails }) => {
  if (!student) return null

  const totalDue =
    feeDetails?.reduce((sum, fee) => sum + (fee.dueAmount || 0), 0) || 0
  const overdueAmount =
    feeDetails?.reduce(
      (sum, fee) => sum + (fee.isOverdue ? fee.dueAmount : 0),
      0
    ) || 0

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{student.name}</h2>
          <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
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
              <span className="text-gray-500">Admission No:</span>
              <div className="font-medium">{student.admissionNumber}</div>
            </div>
            <div>
              <span className="text-gray-500">Father's Name:</span>
              <div className="font-medium">{student.fatherName}</div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-red-600">
            ₹{totalDue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Total Due</div>
          {overdueAmount > 0 && (
            <div className="text-sm text-red-600 mt-1">
              ₹{overdueAmount.toLocaleString()} Overdue
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const FeeDetailsTable = ({
  feeDetails,
  selectedFees,
  onFeeToggle,
  onPartialAmountChange,
}) => {
  if (!feeDetails || feeDetails.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Pending Fees
        </h3>
        <p className="text-gray-500">
          This student has no pending fee payments.
        </p>
      </div>
    )
  }

  const getStatusColor = fee => {
    if (fee.isOverdue) return 'text-red-600 bg-red-100'
    if (fee.dueDate && new Date(fee.dueDate) <= new Date())
      return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getStatusText = fee => {
    if (fee.isOverdue) return 'Overdue'
    if (fee.dueDate && new Date(fee.dueDate) <= new Date()) return 'Due Today'
    return 'Upcoming'
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-medium">Fee Details</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 w-12">
                <input
                  type="checkbox"
                  onChange={e => {
                    const allFeeIds = feeDetails.map(fee => fee.id)
                    if (e.target.checked) {
                      allFeeIds.forEach(id => onFeeToggle(id, true))
                    } else {
                      allFeeIds.forEach(id => onFeeToggle(id, false))
                    }
                  }}
                  checked={feeDetails.every(fee => selectedFees[fee.id])}
                  className="rounded"
                />
              </th>
              <th className="text-left py-3 px-4">Fee Type</th>
              <th className="text-left py-3 px-4">Due Date</th>
              <th className="text-right py-3 px-4">Amount</th>
              <th className="text-right py-3 px-4">Late Fee</th>
              <th className="text-right py-3 px-4">Total Due</th>
              <th className="text-center py-3 px-4">Status</th>
              <th className="text-right py-3 px-4">Collecting</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(feeDetails) &&
              feeDetails.map(fee => (
                <tr key={fee.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedFees[fee.id] || false}
                      onChange={e => onFeeToggle(fee.id, e.target.checked)}
                      className="rounded"
                    />
                  </td>
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
                    {fee.lateFee > 0 ? `₹${fee.lateFee.toLocaleString()}` : '-'}
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
                  <td className="py-3 px-4 text-right">
                    {selectedFees[fee.id] && (
                      <input
                        type="number"
                        value={selectedFees[fee.id]?.amount || fee.dueAmount}
                        onChange={e =>
                          onPartialAmountChange(
                            fee.id,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        max={fee.dueAmount}
                        min="0"
                        step="0.01"
                        className="w-24 px-2 py-1 border rounded text-right"
                      />
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const PaymentPanel = ({ selectedFees, feeDetails, onPaymentComplete }) => {
  const [paymentMode, setPaymentMode] = useState('cash')
  const [paymentDetails, setPaymentDetails] = useState({
    transactionId: '',
    bankName: '',
    chequeNumber: '',
    chequeDate: '',
    upiId: '',
    cardNumber: '',
    remarks: '',
  })
  const [discountAmount, setDiscountAmount] = useState(0)
  const [discountReason, setDiscountReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const selectedFeeIds = Object.keys(selectedFees).filter(
    id => selectedFees[id]
  )
  const totalAmount = selectedFeeIds.reduce((sum, feeId) => {
    const fee = feeDetails.find(f => f.id === feeId)
    return sum + (selectedFees[feeId]?.amount || fee?.dueAmount || 0)
  }, 0)

  const finalAmount = totalAmount - discountAmount

  const paymentModes = [
    { id: 'cash', label: 'Cash', icon: Banknote, color: 'green' },
    { id: 'card', label: 'Card', icon: CreditCard, color: 'blue' },
    { id: 'upi', label: 'UPI', icon: Smartphone, color: 'purple' },
    { id: 'cheque', label: 'Cheque', icon: Receipt, color: 'orange' },
    {
      id: 'bank_transfer',
      label: 'Bank Transfer',
      icon: Banknote,
      color: 'indigo',
    },
  ]

  const handlePayment = async () => {
    if (selectedFeeIds.length === 0) {
      alert('Please select at least one fee to collect')
      return
    }

    setIsProcessing(true)

    try {
      const paymentData = {
        studentId: feeDetails[0]?.studentId,
        feeIds: selectedFeeIds,
        amounts: selectedFeeIds.reduce((acc, feeId) => {
          acc[feeId] =
            selectedFees[feeId]?.amount ||
            feeDetails.find(f => f.id === feeId)?.dueAmount
          return acc
        }, {}),
        paymentMode,
        paymentDetails,
        discountAmount,
        discountReason,
        totalAmount: finalAmount,
        paymentDate: new Date().toISOString(),
      }

      await feesApi.processPayment(paymentData)
      onPaymentComplete(paymentData)
    } catch (error) {
      console.error('Payment processing error:', error)
      alert('Error processing payment. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (selectedFeeIds.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Select Fees to Collect
        </h3>
        <p className="text-gray-500">
          Choose the fees you want to collect payment for.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Payment Summary */}
      <div className="p-6 border-b bg-gray-50">
        <h3 className="font-medium mb-4">Payment Summary</h3>
        <div className="space-y-2">
          {Array.isArray(selectedFeeIds) &&
            selectedFeeIds.map(feeId => {
              const fee = feeDetails.find(f => f.id === feeId)
              const amount = selectedFees[feeId]?.amount || fee?.dueAmount || 0
              return (
                <div key={feeId} className="flex justify-between text-sm">
                  <span>
                    {fee?.feeTypeName} - {fee?.installmentName}
                  </span>
                  <span>₹{amount.toLocaleString()}</span>
                </div>
              )
            })}
          <div className="border-t pt-2 flex justify-between font-medium">
            <span>Subtotal</span>
            <span>₹{totalAmount.toLocaleString()}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-₹{discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between text-lg font-bold">
            <span>Total Amount</span>
            <span>₹{finalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payment Mode Selection */}
      <div className="p-6 border-b">
        <h4 className="font-medium mb-3">Payment Mode</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.isArray(paymentModes) &&
            paymentModes.map(mode => {
              const Icon = mode.icon
              return (
                <button
                  key={mode.id}
                  onClick={() => setPaymentMode(mode.id)}
                  className={`p-3 border rounded-lg flex items-center gap-2 transition-colors ${
                    paymentMode === mode.id
                      ? `border-${mode.color}-500 bg-${mode.color}-50 text-${mode.color}-700`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{mode.label}</span>
                </button>
              )
            })}
        </div>
      </div>

      {/* Payment Details */}
      <div className="p-6 border-b">
        <h4 className="font-medium mb-3">Payment Details</h4>
        <div className="space-y-4">
          {paymentMode === 'cheque' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Cheque Number"
                  value={paymentDetails.chequeNumber}
                  onChange={e =>
                    setPaymentDetails(prev => ({
                      ...prev,
                      chequeNumber: e.target.value,
                    }))
                  }
                  placeholder="Enter cheque number"
                />
                <Input
                  label="Cheque Date"
                  type="date"
                  value={paymentDetails.chequeDate}
                  onChange={e =>
                    setPaymentDetails(prev => ({
                      ...prev,
                      chequeDate: e.target.value,
                    }))
                  }
                />
              </div>
              <Input
                label="Bank Name"
                value={paymentDetails.bankName}
                onChange={e =>
                  setPaymentDetails(prev => ({
                    ...prev,
                    bankName: e.target.value,
                  }))
                }
                placeholder="Enter bank name"
              />
            </>
          )}

          {paymentMode === 'bank_transfer' && (
            <>
              <Input
                label="Transaction ID"
                value={paymentDetails.transactionId}
                onChange={e =>
                  setPaymentDetails(prev => ({
                    ...prev,
                    transactionId: e.target.value,
                  }))
                }
                placeholder="Enter transaction ID"
              />
              <Input
                label="Bank Name"
                value={paymentDetails.bankName}
                onChange={e =>
                  setPaymentDetails(prev => ({
                    ...prev,
                    bankName: e.target.value,
                  }))
                }
                placeholder="Enter bank name"
              />
            </>
          )}

          {paymentMode === 'upi' && (
            <Input
              label="UPI ID / Transaction ID"
              value={paymentDetails.upiId}
              onChange={e =>
                setPaymentDetails(prev => ({ ...prev, upiId: e.target.value }))
              }
              placeholder="Enter UPI ID or transaction ID"
            />
          )}

          {paymentMode === 'card' && (
            <Input
              label="Card Number (Last 4 digits)"
              value={paymentDetails.cardNumber}
              onChange={e =>
                setPaymentDetails(prev => ({
                  ...prev,
                  cardNumber: e.target.value,
                }))
              }
              placeholder="****"
              maxLength={4}
            />
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Remarks</label>
            <textarea
              value={paymentDetails.remarks}
              onChange={e =>
                setPaymentDetails(prev => ({
                  ...prev,
                  remarks: e.target.value,
                }))
              }
              rows={2}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Additional remarks..."
            />
          </div>
        </div>
      </div>

      {/* Discount Section */}
      <div className="p-6 border-b">
        <h4 className="font-medium mb-3">Discount (Optional)</h4>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Discount Amount"
            type="number"
            value={discountAmount}
            onChange={e => setDiscountAmount(parseFloat(e.target.value) || 0)}
            min="0"
            max={totalAmount}
            placeholder="0"
          />
          <Input
            label="Discount Reason"
            value={discountReason}
            onChange={e => setDiscountReason(e.target.value)}
            placeholder="Reason for discount"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6">
        <div className="flex gap-3">
          <button
            onClick={handlePayment}
            disabled={isProcessing || finalAmount <= 0}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
          >
            {isProcessing ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            {isProcessing
              ? 'Processing...'
              : `Collect ₹${finalAmount.toLocaleString()}`}
          </button>
          <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Draft
          </button>
        </div>
      </div>
    </div>
  )
}

const PaymentSuccessDialog = ({
  open,
  onClose,
  paymentData,
  onPrintReceipt,
}) => {
  if (!paymentData) return null

  return (
    <Dialog open={open} onClose={onClose} title="Payment Successful" size="lg">
      <div className="text-center py-6">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
        <h2 className="text-2xl font-bold text-green-600 mb-2">
          Payment Collected Successfully!
        </h2>
        <p className="text-gray-600 mb-6">
          Amount of ₹{paymentData.totalAmount?.toLocaleString()} has been
          collected successfully.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-medium mb-2">Payment Details</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="font-medium capitalize">
                {paymentData.paymentMode?.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Transaction Date:</span>
              <span className="font-medium">
                {new Date(paymentData.paymentDate).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Receipt Number:</span>
              <span className="font-medium">RCP{Date.now()}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onPrintReceipt(paymentData)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const CollectFees = () => {
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedFees, setSelectedFees] = useState({})
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)
  const [lastPaymentData, setLastPaymentData] = useState(null)

  const queryClient = useQueryClient()

  const { data: feeDetailsData, isLoading } = useQuery({
    queryKey: ['student-fees', selectedStudent?.id],
    queryFn: () => feesApi.getStudentFeeDetails(selectedStudent.id),
    enabled: !!selectedStudent,
  })

  const handleStudentSelect = student => {
    setSelectedStudent(student)
    setSelectedFees({})
  }

  const handleFeeToggle = (feeId, isSelected) => {
    if (isSelected) {
      const fee = feeDetailsData?.data?.find(f => f.id === feeId)
      setSelectedFees(prev => ({
        ...prev,
        [feeId]: { amount: fee?.dueAmount || 0 },
      }))
    } else {
      setSelectedFees(prev => {
        const updated = { ...prev }
        delete updated[feeId]
        return updated
      })
    }
  }

  const handlePartialAmountChange = (feeId, amount) => {
    setSelectedFees(prev => ({
      ...prev,
      [feeId]: { amount },
    }))
  }

  const handlePaymentComplete = paymentData => {
    setLastPaymentData(paymentData)
    setShowPaymentSuccess(true)
    setSelectedFees({})

    // Refresh student fee details
    queryClient.invalidateQueries(['student-fees', selectedStudent?.id])
  }

  const handlePrintReceipt = async paymentData => {
    try {
      const receiptHTML = generateReceiptHTML(paymentData, selectedStudent)
      await printToPDF(receiptHTML, `receipt-${Date.now()}.pdf`)
    } catch (error) {
      console.error('Print error:', error)
      alert('Error printing receipt. Please try again.')
    }
  }

  const generateReceiptHTML = (paymentData, student) => {
    const receiptNumber = `RCP${Date.now()}`

    return `
      <div style="max-width: 400px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px;">GREENWOOD HIGH SCHOOL</h1>
          <p style="margin: 5px 0; font-size: 14px;">123 School Street, Education City</p>
          <p style="margin: 5px 0; font-size: 14px;">Phone: +91 98765 43210</p>
          <h2 style="margin: 10px 0; font-size: 18px;">FEE RECEIPT</h2>
        </div>
        
        <div style="margin-bottom: 20px;">
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td><strong>Receipt No:</strong></td>
              <td>${receiptNumber}</td>
            </tr>
            <tr>
              <td><strong>Date:</strong></td>
              <td>${new Date(paymentData.paymentDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td><strong>Student Name:</strong></td>
              <td>${student.name}</td>
            </tr>
            <tr>
              <td><strong>Roll Number:</strong></td>
              <td>${student.rollNumber}</td>
            </tr>
            <tr>
              <td><strong>Class:</strong></td>
              <td>${student.className} - ${student.section}</td>
            </tr>
            <tr>
              <td><strong>Payment Mode:</strong></td>
              <td style="text-transform: capitalize;">${paymentData.paymentMode.replace('_', ' ')}</td>
            </tr>
          </table>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="margin-bottom: 10px; font-size: 16px;">Fee Details:</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Description</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${Object.keys(paymentData.amounts)
                .map(feeId => {
                  const fee = feeDetailsData?.data?.find(f => f.id === feeId)
                  return `
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${fee?.feeTypeName} - ${fee?.installmentName}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${paymentData.amounts[feeId].toLocaleString()}</td>
                  </tr>
                `
                })
                .join('')}
              ${
                paymentData.discountAmount > 0
                  ? `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">Discount</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right; color: green;">-₹${paymentData.discountAmount.toLocaleString()}</td>
                </tr>
              `
                  : ''
              }
              <tr style="background: #f5f5f5; font-weight: bold;">
                <td style="border: 1px solid #ddd; padding: 8px;">Total Amount</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${paymentData.totalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
          <p>This is a computer generated receipt and does not require signature.</p>
          <p>Thank you for your payment!</p>
        </div>
      </div>
    `
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Collect Fees</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleString()}
        </div>
      </div>

      {/* Student Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Search Student</h2>
        <StudentSearchBar
          onStudentSelect={handleStudentSelect}
          selectedStudent={selectedStudent}
        />
      </div>

      {selectedStudent && (
        <>
          {/* Student Info */}
          <StudentInfoCard
            student={selectedStudent}
            feeDetails={feeDetailsData?.data}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Fee Details */}
            <div className="lg:col-span-2">
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                <FeeDetailsTable
                  feeDetails={feeDetailsData?.data}
                  selectedFees={selectedFees}
                  onFeeToggle={handleFeeToggle}
                  onPartialAmountChange={handlePartialAmountChange}
                />
              )}
            </div>

            {/* Payment Panel */}
            <div className="lg:col-span-1">
              <PaymentPanel
                selectedFees={selectedFees}
                feeDetails={feeDetailsData?.data}
                onPaymentComplete={handlePaymentComplete}
              />
            </div>
          </div>
        </>
      )}

      {/* Payment Success Dialog */}
      <PaymentSuccessDialog
        open={showPaymentSuccess}
        onClose={() => setShowPaymentSuccess(false)}
        paymentData={lastPaymentData}
        onPrintReceipt={handlePrintReceipt}
      />
    </div>
  )
}

export default CollectFees
