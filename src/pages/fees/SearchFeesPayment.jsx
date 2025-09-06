import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  Printer,
  RefreshCw,
  DollarSign,
  User,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Clock,
} from 'lucide-react'
import Input from '../../components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import { feesApi } from '../../lib/api/fees'
import { printToPDF } from '../../lib/print'

const PaymentFilters = ({ filters, onFiltersChange }) => {
  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => feesApi.getClasses(),
  })

  const { data: feeGroupsData } = useQuery({
    queryKey: ['fee-groups', 'active'],
    queryFn: () => feesApi.getActiveFeeGroups(),
  })

  const paymentModes = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'upi', label: 'UPI' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
  ]

  const paymentStatuses = [
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' },
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
              paymentMode: '',
              status: '',
              dateFrom: '',
              dateTo: '',
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

        {/* Payment Mode Filter */}
        <select
          value={filters.paymentMode}
          onChange={e =>
            onFiltersChange({ ...filters, paymentMode: e.target.value })
          }
          className="border rounded-lg px-3 py-2"
        >
          <option value="">All Payment Modes</option>
          {Array.isArray(paymentModes) &&
            paymentModes.map(mode => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
        </select>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={e =>
            onFiltersChange({ ...filters, status: e.target.value })
          }
          className="border rounded-lg px-3 py-2"
        >
          <option value="">All Statuses</option>
          {Array.isArray(paymentStatuses) &&
            paymentStatuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
        </select>

        {/* Date Range */}
        <Input
          label="From Date"
          type="date"
          value={filters.dateFrom}
          onChange={e =>
            onFiltersChange({ ...filters, dateFrom: e.target.value })
          }
        />

        <Input
          label="To Date"
          type="date"
          value={filters.dateTo}
          onChange={e =>
            onFiltersChange({ ...filters, dateTo: e.target.value })
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

const PaymentCard = ({ payment, onViewDetails, onPrintReceipt }) => {
  const getStatusColor = status => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      case 'cancelled':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPaymentModeIcon = mode => {
    switch (mode) {
      case 'cash':
        return '💵'
      case 'card':
        return '💳'
      case 'upi':
        return '📱'
      case 'cheque':
        return '🏦'
      case 'bank_transfer':
        return '🏛️'
      default:
        return '💰'
    }
  }

  return (
    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold">{payment.studentName}</h3>
            <p className="text-sm text-gray-600">
              {payment.className} - {payment.section} | Roll:{' '}
              {payment.rollNumber}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-green-600">
            ₹{payment.amount.toLocaleString()}
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}
          >
            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Receipt No:</span>
          <div className="font-medium">{payment.receiptNumber}</div>
        </div>
        <div>
          <span className="text-gray-500">Payment Date:</span>
          <div className="font-medium">
            {new Date(payment.paymentDate).toLocaleDateString()}
          </div>
        </div>
        <div>
          <span className="text-gray-500">Payment Mode:</span>
          <div className="font-medium flex items-center gap-1">
            <span>{getPaymentModeIcon(payment.paymentMode)}</span>
            {payment.paymentMode.replace('_', ' ').toUpperCase()}
          </div>
        </div>
        <div>
          <span className="text-gray-500">Fee Group:</span>
          <div className="font-medium">{payment.feeGroupName}</div>
        </div>
      </div>

      {payment.feeTypes && payment.feeTypes.length > 0 && (
        <div className="border-t pt-3 mb-4">
          <div className="text-sm text-gray-600 mb-2">Fee Types:</div>
          <div className="flex flex-wrap gap-1">
            {payment.feeTypes.slice(0, 3).map((feeType, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
              >
                {feeType.name}
              </span>
            ))}
            {payment.feeTypes.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                +{payment.feeTypes.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {payment.remarks && (
        <div className="border-t pt-3 mb-4">
          <div className="text-sm text-gray-600 mb-1">Remarks:</div>
          <div className="text-sm">{payment.remarks}</div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Collected by: {payment.collectedBy}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(payment)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPrintReceipt(payment)}
            className="p-1 text-gray-400 hover:text-green-600"
            title="Print Receipt"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

const PaymentDetailsDialog = ({ payment, open, onClose }) => {
  if (!payment) return null

  const getStatusColor = status => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      case 'cancelled':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Payment Details" size="lg">
      <div className="space-y-6">
        {/* Student Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium mb-3">Student Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Name:</span>
              <div className="font-medium">{payment.studentName}</div>
            </div>
            <div>
              <span className="text-gray-500">Roll Number:</span>
              <div className="font-medium">{payment.rollNumber}</div>
            </div>
            <div>
              <span className="text-gray-500">Class:</span>
              <div className="font-medium">
                {payment.className} - {payment.section}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Admission Number:</span>
              <div className="font-medium">{payment.admissionNumber}</div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium mb-3">Payment Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Receipt Number:</span>
              <div className="font-medium">{payment.receiptNumber}</div>
            </div>
            <div>
              <span className="text-gray-500">Payment Date:</span>
              <div className="font-medium">
                {new Date(payment.paymentDate).toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Payment Mode:</span>
              <div className="font-medium capitalize">
                {payment.paymentMode.replace('_', ' ')}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}
              >
                {payment.status.charAt(0).toUpperCase() +
                  payment.status.slice(1)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Amount:</span>
              <div className="font-medium text-lg text-green-600">
                ₹{payment.amount.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Collected By:</span>
              <div className="font-medium">{payment.collectedBy}</div>
            </div>
          </div>
        </div>

        {/* Payment Method Details */}
        {payment.paymentDetails && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="font-medium mb-3">Payment Method Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {payment.paymentMode === 'cheque' && (
                <>
                  <div>
                    <span className="text-gray-500">Cheque Number:</span>
                    <div className="font-medium">
                      {payment.paymentDetails.chequeNumber}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Cheque Date:</span>
                    <div className="font-medium">
                      {payment.paymentDetails.chequeDate}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Bank Name:</span>
                    <div className="font-medium">
                      {payment.paymentDetails.bankName}
                    </div>
                  </div>
                </>
              )}
              {payment.paymentMode === 'bank_transfer' && (
                <>
                  <div>
                    <span className="text-gray-500">Transaction ID:</span>
                    <div className="font-medium">
                      {payment.paymentDetails.transactionId}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Bank Name:</span>
                    <div className="font-medium">
                      {payment.paymentDetails.bankName}
                    </div>
                  </div>
                </>
              )}
              {payment.paymentMode === 'upi' && (
                <div>
                  <span className="text-gray-500">
                    UPI ID / Transaction ID:
                  </span>
                  <div className="font-medium">
                    {payment.paymentDetails.upiId}
                  </div>
                </div>
              )}
              {payment.paymentMode === 'card' && (
                <div>
                  <span className="text-gray-500">Card Number:</span>
                  <div className="font-medium">
                    ****{payment.paymentDetails.cardNumber}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fee Details */}
        <div>
          <h3 className="font-medium mb-3">Fee Details</h3>
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-4">Fee Type</th>
                  <th className="text-right py-2 px-4">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payment.feeTypes?.map((feeType, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">{feeType.name}</td>
                    <td className="py-2 px-4 text-right">
                      ₹{feeType.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {payment.discountAmount > 0 && (
                  <tr className="border-b">
                    <td className="py-2 px-4 text-green-600">Discount</td>
                    <td className="py-2 px-4 text-right text-green-600">
                      -₹{payment.discountAmount.toLocaleString()}
                    </td>
                  </tr>
                )}
                <tr className="bg-gray-50 font-bold">
                  <td className="py-2 px-4">Total Amount</td>
                  <td className="py-2 px-4 text-right">
                    ₹{payment.amount.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Remarks */}
        {payment.remarks && (
          <div>
            <h3 className="font-medium mb-2">Remarks</h3>
            <div className="bg-gray-50 rounded p-3 text-sm">
              {payment.remarks}
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

const SearchFeesPayment = () => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    classId: '',
    feeGroupId: '',
    paymentMode: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    amountFrom: '',
    amountTo: '',
  })
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [sortBy, setSortBy] = useState('paymentDate')
  const [sortOrder, setSortOrder] = useState('desc')

  const {
    data: paymentsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['fee-payments', 'search', filters, sortBy, sortOrder],
    queryFn: () => feesApi.searchPayments({ ...filters, sortBy, sortOrder }),
  })

  const handleViewDetails = payment => {
    setSelectedPayment(payment)
    setShowDetailsDialog(true)
  }

  const handlePrintReceipt = async payment => {
    try {
      const receiptHTML = generateReceiptHTML(payment)
      await printToPDF(receiptHTML, `receipt-${payment.receiptNumber}.pdf`)
    } catch (error) {
      console.error('Print error:', error)
      alert('Error printing receipt. Please try again.')
    }
  }

  const handleExportData = async () => {
    try {
      const exportData = paymentsData?.data || []
      const csvContent = generateCSVContent(exportData)
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fee-payments-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      alert('Error exporting data. Please try again.')
    }
  }

  const generateReceiptHTML = payment => {
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
              <td>${payment.receiptNumber}</td>
            </tr>
            <tr>
              <td><strong>Date:</strong></td>
              <td>${new Date(payment.paymentDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td><strong>Student Name:</strong></td>
              <td>${payment.studentName}</td>
            </tr>
            <tr>
              <td><strong>Roll Number:</strong></td>
              <td>${payment.rollNumber}</td>
            </tr>
            <tr>
              <td><strong>Class:</strong></td>
              <td>${payment.className} - ${payment.section}</td>
            </tr>
            <tr>
              <td><strong>Payment Mode:</strong></td>
              <td style="text-transform: capitalize;">${payment.paymentMode.replace('_', ' ')}</td>
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
              ${
                payment.feeTypes
                  ?.map(
                    feeType => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${feeType.name}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${feeType.amount.toLocaleString()}</td>
                </tr>
              `,
                  )
                  .join('') || ''
              }
              ${
                payment.discountAmount > 0
                  ? `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">Discount</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right; color: green;">-₹${payment.discountAmount.toLocaleString()}</td>
                </tr>
              `
                  : ''
              }
              <tr style="background: #f5f5f5; font-weight: bold;">
                <td style="border: 1px solid #ddd; padding: 8px;">Total Amount</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${payment.amount.toLocaleString()}</td>
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

  const generateCSVContent = data => {
    const headers = [
      'Receipt Number',
      'Student Name',
      'Roll Number',
      'Class',
      'Payment Date',
      'Payment Mode',
      'Amount',
      'Status',
      'Collected By',
    ]

    const rows = data.map(payment => [
      payment.receiptNumber,
      payment.studentName,
      payment.rollNumber,
      `${payment.className} - ${payment.section}`,
      new Date(payment.paymentDate).toLocaleDateString(),
      payment.paymentMode.replace('_', ' '),
      payment.amount,
      payment.status,
      payment.collectedBy,
    ])

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  const getStatistics = () => {
    const payments = paymentsData?.data || []
    const totalAmount = Array.isArray(payments)
      ? payments.reduce((sum, payment) => sum + payment.amount, 0)
      : 0
    const completedPayments = payments.filter(p => p.status === 'completed')
    const pendingPayments = payments.filter(p => p.status === 'pending')

    return {
      total: payments.length,
      totalAmount,
      completed: completedPayments.length,
      pending: pendingPayments.length,
    }
  }

  const stats = getStatistics()

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Search Fee Payments</h1>
        <div className="flex gap-2">
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
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Payments</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">
                ₹{stats.totalAmount.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Amount</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <PaymentFilters filters={filters} onFiltersChange={setFilters} />

      {/* Sort Options */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="paymentDate">Payment Date</option>
              <option value="amount">Amount</option>
              <option value="studentName">Student Name</option>
              <option value="receiptNumber">Receipt Number</option>
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
          <div className="text-sm text-gray-500">
            Showing {paymentsData?.data?.length || 0} payments
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {paymentsData?.data?.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Payments Found
            </h3>
            <p className="text-gray-500">
              No fee payments match your search criteria. Try adjusting your
              filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {paymentsData?.data?.map(payment => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                onViewDetails={handleViewDetails}
                onPrintReceipt={handlePrintReceipt}
              />
            ))}
          </div>
        )}
      </div>

      {/* Payment Details Dialog */}
      <PaymentDetailsDialog
        payment={selectedPayment}
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
      />
    </div>
  )
}

export default SearchFeesPayment
