import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  FileText,
  Users,
  Calendar,
  PieChart,
  BarChart3,
  Plus,
  Download,
  Eye,
  Calculator,
  Archive,
  Layers,
} from 'lucide-react'
import { withRoleGuard } from '../../guards/withRoleGuard.jsx'
import { USER_ROLES } from '../../constants/auth'
import {
  useDashboardKpis,
  useFeesSummary,
  useFeePayments,
  useStudents,
  useRecordPayment,
} from '../../hooks/useApi'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  KpiCard,
  TrendChart,
  DataTable,
  QuickActions,
  FormDialog,
  Button,
  Input,
  Select,
  Badge,
  LoadingSkeleton,
  ErrorState,
  EmptyState,
} from '../../components/ui'

const AccountantDashboard = () => {
  const navigate = useNavigate()

  // State for dialogs
  const [collectFeeDialogOpen, setCollectFeeDialogOpen] = useState(false)
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false)
  const [viewReceiptDialogOpen, setViewReceiptDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)

  // Fetch dashboard data
  const {
    data: kpis,
    isLoading: kpisLoading,
    error: kpisError,
  } = useDashboardKpis('accountant')
  const { data: feesSummary, isLoading: feesLoading } = useFeesSummary()
  const { data: feePayments = [] } = useFeePayments()
  const { data: students = [] } = useStudents()

  // Mutations
  const recordPaymentMutation = useRecordPayment()

  // Generate fee collection chart data (last 7 days)
  const feeCollectionData = React.useMemo(() => {
    const data = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const dayPayments = feePayments.filter(
        payment => payment.paymentDate === dateStr && payment.status === 'paid',
      )
      const totalAmount = Array.isArray(dayPayments)
        ? dayPayments.reduce((sum, payment) => sum + payment.amount, 0)
        : 0

      data.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        value: totalAmount,
      })
    }
    return data
  }, [feePayments])

  // Generate expense breakdown data
  const expenseData = [
    { name: 'Salaries', value: 150000 },
    { name: 'Utilities', value: 25000 },
    { name: 'Maintenance', value: 15000 },
    { name: 'Supplies', value: 10000 },
    { name: 'Others', value: 8000 },
  ]

  // Calculate today's collection
  const todayCollection = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const todayPayments = feePayments.filter(
      payment => payment.paymentDate === today && payment.status === 'paid',
    )
    return Array.isArray(todayPayments)
      ? todayPayments.reduce((sum, payment) => sum + payment.amount, 0)
      : 0
  }, [feePayments])

  // KPI Cards data
  const kpiCards = [
    {
      title: "Today's Collection",
      value: `₹${todayCollection.toLocaleString()}`,
      change: '+12%',
      changeType: 'positive',
      icon: DollarSign,
      description: 'from yesterday',
    },
    {
      title: 'Monthly Collection',
      value: `₹${kpis?.totalCollection?.toLocaleString() || 0}`,
      change: `${kpis?.collectionRate || 0}%`,
      changeType: 'positive',
      icon: TrendingUp,
      description: 'collection rate',
    },
    {
      title: 'Pending Dues',
      value: `₹${feesSummary?.totalPending?.toLocaleString() || 0}`,
      change: `${feesSummary?.pendingStudents || 0} students`,
      changeType: 'negative',
      icon: CreditCard,
      description: 'outstanding',
    },
    {
      title: 'Total Transactions',
      value: kpis?.totalTransactions?.toString() || '0',
      change: '+15',
      changeType: 'positive',
      icon: FileText,
      description: 'this month',
    },
  ]

  // Quick Actions
  const quickActions = [
    {
      id: 'collect-fee',
      label: 'Collect Fee',
      icon: DollarSign,
      variant: 'default',
      description: 'Record fee payment',
      onClick: () => setCollectFeeDialogOpen(true),
    },
    {
      id: 'add-expense',
      label: 'Add Expense',
      icon: Plus,
      variant: 'outline',
      description: 'Record new expense',
      onClick: () => setAddExpenseDialogOpen(true),
    },
    {
      id: 'generate-report',
      label: 'Generate Report',
      icon: Download,
      variant: 'outline',
      description: 'Financial reports',
    },
    {
      id: 'view-analytics',
      label: 'View Analytics',
      icon: BarChart3,
      variant: 'outline',
      description: 'Detailed analytics',
    },
  ]

  // Table columns for fees due
  const feesDueColumns = [
    {
      key: 'student',
      header: 'Student',
      render: (_, row) => {
        const student = students.find(s => s.id === row.studentId)
        return student ? (
          <div>
            <div className="font-medium">{student.name}</div>
            <div className="text-sm text-gray-500">{student.rollNumber}</div>
          </div>
        ) : (
          'Unknown Student'
        )
      },
    },
    {
      key: 'amount',
      header: 'Amount Due',
      render: value => `₹${value.toLocaleString()}`,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: () => {
        const dueDate = new Date()
        dueDate.setDate(10) // Assuming fees are due on 10th of each month
        return dueDate.toLocaleDateString()
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: value => (
        <Badge variant={value === 'paid' ? 'success' : 'warning'}>
          {value === 'paid' ? 'Paid' : 'Pending'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCollectFee(row)}
            disabled={row.status === 'paid'}
          >
            Collect
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewReceipt(row)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  // Table columns for recent payments
  const paymentsColumns = [
    {
      key: 'student',
      header: 'Student',
      render: (_, row) => {
        const student = students.find(s => s.id === row.studentId)
        return student ? (
          <div>
            <div className="font-medium">{student.name}</div>
            <div className="text-sm text-gray-500">{student.rollNumber}</div>
          </div>
        ) : (
          'Unknown Student'
        )
      },
    },
    {
      key: 'amount',
      header: 'Amount',
      render: value => `₹${value.toLocaleString()}`,
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      render: value => (
        <Badge variant="outline" className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: 'paymentDate',
      header: 'Date',
      render: value => new Date(value).toLocaleDateString(),
    },
    {
      key: 'transactionId',
      header: 'Transaction ID',
      render: value => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: 'actions',
      header: 'Receipt',
      render: (_, row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleViewReceipt(row)}
        >
          <Download className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  // Event handlers
  const handleCollectFee = feeRecord => {
    setSelectedPayment(feeRecord)
    setCollectFeeDialogOpen(true)
  }

  const handleViewReceipt = payment => {
    setSelectedPayment(payment)
    setViewReceiptDialogOpen(true)
  }

  const handleRecordPayment = async event => {
    event.preventDefault()
    const formData = new FormData(event.target)

    try {
      await recordPaymentMutation.mutateAsync({
        studentId: formData.get('studentId'),
        feeId: 'fee-1',
        amount: parseFloat(formData.get('amount')),
        paymentMethod: formData.get('paymentMethod'),
        receivedBy: 'current-accountant',
        remarks: formData.get('remarks'),
      })
      setCollectFeeDialogOpen(false)
      setSelectedPayment(null)
    } catch (error) {
      console.error('Failed to record payment:', error)
    }
  }

  // Get pending fee payments for table
  const pendingFees = React.useMemo(() => {
    return feePayments
      .filter(payment => payment.status === 'pending')
      .slice(0, 10)
  }, [feePayments])

  // Get recent payments for table
  const recentPayments = React.useMemo(() => {
    return feePayments
      .filter(payment => payment.status === 'paid')
      .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
      .slice(0, 10)
  }, [feePayments])

  // Handle loading states
  if (kpisLoading || feesLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Accountant Dashboard
            </h1>
            <p className="text-gray-600">
              Financial management and fee collection
            </p>
          </div>
        </div>
        <LoadingSkeleton.Dashboard />
      </div>
    )
  }

  // Handle error states
  if (kpisError) {
    return (
      <div className="p-6">
        <ErrorState
          error={kpisError}
          onRetry={() => window.location.reload()}
          showRetry={true}
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Accountant Dashboard
          </h1>
          <p className="text-gray-600">
            Financial management and fee collection
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="success" className="flex items-center space-x-1">
            <DollarSign className="h-3 w-3" />
            <span>₹{todayCollection.toLocaleString()} Today</span>
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.isArray(kpiCards) &&
          kpiCards.map((kpi, index) => <KpiCard key={index} {...kpi} />)}
      </div>

      {/* Quick Actions */}
      <QuickActions
        title="Quick Actions"
        actions={quickActions}
        variant="card"
        layout="grid"
      />

      {/* Finance Management Modules */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Finance Management
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profit & Loss */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/dashboard/finance/profit-loss')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Profit & Loss</h3>
                  <p className="text-sm text-gray-600">
                    Financial Overview & Reports
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-green-600">₹2.5L</div>
                  <div className="text-gray-500">Income</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-red-600">₹1.8L</div>
                  <div className="text-gray-500">Expenses</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="font-bold text-blue-600 text-lg">
                  ₹70K Profit
                </div>
                <div className="text-xs text-gray-500">This Month</div>
              </div>
            </CardContent>
          </Card>

          {/* Income Management */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/dashboard/finance/search-income')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Income Management
                  </h3>
                  <p className="text-sm text-gray-600">Track & Manage Income</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-green-600">156</div>
                  <div className="text-gray-500">Records</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-600">12</div>
                  <div className="text-gray-500">Categories</div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={e => {
                    e.stopPropagation()
                    navigate('/dashboard/finance/add-income')
                  }}
                  className="flex-1 bg-green-50 text-green-700 px-3 py-1 rounded text-xs hover:bg-green-100"
                >
                  Add Income
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    navigate('/dashboard/finance/income-head')
                  }}
                  className="flex-1 bg-blue-50 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-100"
                >
                  Manage Heads
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Expense Management */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/dashboard/finance/search-expense')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Calculator className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Expense Management
                  </h3>
                  <p className="text-sm text-gray-600">
                    Track & Control Expenses
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-red-600">89</div>
                  <div className="text-gray-500">Records</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-orange-600">8</div>
                  <div className="text-gray-500">Categories</div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={e => {
                    e.stopPropagation()
                    navigate('/dashboard/finance/add-expense')
                  }}
                  className="flex-1 bg-red-50 text-red-700 px-3 py-1 rounded text-xs hover:bg-red-100"
                >
                  Add Expense
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    navigate('/dashboard/finance/expense-head')
                  }}
                  className="flex-1 bg-orange-50 text-orange-700 px-3 py-1 rounded text-xs hover:bg-orange-100"
                >
                  Manage Heads
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Finance Tools */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <button
            onClick={() => navigate('/dashboard/finance/add-income')}
            className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <Plus className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-sm font-medium">Add Income</div>
          </button>

          <button
            onClick={() => navigate('/dashboard/finance/add-expense')}
            className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <Plus className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <div className="text-sm font-medium">Add Expense</div>
          </button>

          <button
            onClick={() => navigate('/dashboard/finance/search-income')}
            className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <Archive className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-sm font-medium">Income Reports</div>
          </button>

          <button
            onClick={() => navigate('/dashboard/finance/search-expense')}
            className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <Archive className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <div className="text-sm font-medium">Expense Reports</div>
          </button>

          <button
            onClick={() => navigate('/dashboard/finance/income-head')}
            className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <Layers className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-sm font-medium">Income Heads</div>
          </button>

          <button
            onClick={() => navigate('/dashboard/finance/expense-head')}
            className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <Layers className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <div className="text-sm font-medium">Expense Heads</div>
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          title="Daily Fee Collection"
          description="Fee collection trend for the past 7 days"
          data={feeCollectionData}
          type="bar"
          color="#10b981"
          formatTooltip={value => [`₹${value.toLocaleString()}`, 'Collection']}
          formatYAxis={value => `₹${(value / 1000).toFixed(0)}k`}
        />

        <TrendChart
          title="Expense Breakdown"
          description="Monthly expense distribution by category"
          data={expenseData}
          type="pie"
          colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']}
          formatTooltip={value => [`₹${value.toLocaleString()}`, 'Amount']}
        />
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fees Due Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Fees Due</span>
              </div>
              <Badge variant="warning">{pendingFees.length} pending</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingFees.length === 0 ? (
              <EmptyState
                title="No Pending Fees"
                description="All fees have been collected."
                variant="financial"
              />
            ) : (
              <DataTable
                data={pendingFees}
                columns={feesDueColumns}
                sortable={true}
                paginated={false}
                emptyMessage="No pending fees found"
              />
            )}
          </CardContent>
        </Card>

        {/* Recent Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Recent Payments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <EmptyState
                title="No Recent Payments"
                description="No payments recorded recently."
                variant="financial"
              />
            ) : (
              <DataTable
                data={recentPayments}
                columns={paymentsColumns}
                sortable={true}
                paginated={false}
                emptyMessage="No payments found"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChart className="h-5 w-5" />
            <span>Financial Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                ₹{feesSummary?.totalPaid?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600">Total Collected</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                ₹{feesSummary?.totalPending?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600">Total Pending</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {feesSummary?.collectionPercentage || 0}%
              </div>
              <div className="text-sm text-gray-600">Collection Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collect Fee Dialog */}
      <FormDialog
        open={collectFeeDialogOpen}
        onOpenChange={setCollectFeeDialogOpen}
        title="Collect Fee Payment"
        description="Record a new fee payment"
        onSubmit={handleRecordPayment}
        submitLabel="Record Payment"
        loading={recordPaymentMutation.isPending}
      >
        <div className="space-y-4">
          <Select name="studentId" label="Student" required>
            <option value="">Select Student</option>
            {students.slice(0, 20).map(student => (
              <option key={student.id} value={student.id}>
                {student.name} - {student.rollNumber}
              </option>
            ))}
          </Select>
          <Input
            name="amount"
            type="number"
            label="Amount"
            placeholder="5000"
            defaultValue={selectedPayment?.amount}
            required
          />
          <Select name="paymentMethod" label="Payment Method" required>
            <option value="">Select Method</option>
            <option value="cash">Cash</option>
            <option value="card">Credit/Debit Card</option>
            <option value="online">Online Transfer</option>
            <option value="cheque">Cheque</option>
            <option value="upi">UPI</option>
          </Select>
          <Input
            name="remarks"
            label="Remarks"
            placeholder="Optional remarks"
          />
        </div>
      </FormDialog>

      {/* Add Expense Dialog */}
      <FormDialog
        open={addExpenseDialogOpen}
        onOpenChange={setAddExpenseDialogOpen}
        title="Add Expense"
        description="Record a new expense"
        onSubmit={() => setAddExpenseDialogOpen(false)}
        submitLabel="Add Expense"
      >
        <div className="space-y-4">
          <Input
            name="description"
            label="Description"
            placeholder="Expense description"
            required
          />
          <Select name="category" label="Category" required>
            <option value="">Select Category</option>
            <option value="salaries">Salaries</option>
            <option value="utilities">Utilities</option>
            <option value="maintenance">Maintenance</option>
            <option value="supplies">Supplies</option>
            <option value="others">Others</option>
          </Select>
          <Input
            name="amount"
            type="number"
            label="Amount"
            placeholder="10000"
            required
          />
          <Input name="date" type="date" label="Date" required />
          <Input
            name="remarks"
            label="Remarks"
            placeholder="Additional notes"
          />
        </div>
      </FormDialog>

      {/* View Receipt Dialog */}
      <FormDialog
        open={viewReceiptDialogOpen}
        onOpenChange={setViewReceiptDialogOpen}
        title="Payment Receipt"
        description="Payment receipt details"
        submitLabel="Close"
        onSubmit={() => setViewReceiptDialogOpen(false)}
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold">Payment Receipt</h3>
                <p className="text-sm text-gray-600">
                  Transaction ID: {selectedPayment.transactionId}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Student:</span>
                  <span className="font-medium">
                    {students.find(s => s.id === selectedPayment.studentId)
                      ?.name || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium">
                    ₹{selectedPayment.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-medium capitalize">
                    {selectedPayment.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">
                    {selectedPayment.paymentDate
                      ? new Date(
                          selectedPayment.paymentDate
                        ).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge
                    variant={
                      selectedPayment.status === 'paid' ? 'success' : 'warning'
                    }
                  >
                    {selectedPayment.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            </div>
          </div>
        )}
      </FormDialog>
    </div>
  )
}

export default withRoleGuard([USER_ROLES.ACCOUNTANT])(AccountantDashboard)
