import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  BookOpen,
  Bell,
  UserPlus,
  CreditCard,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  Calculator,
  Send,
  FileText,
  GraduationCap,
  PieChart,
  Mail,
  Phone,
  Clipboard,
  Target,
  Copy,
  BarChart3,
} from 'lucide-react'
import { withRoleGuard } from '../../guards/withRoleGuard.jsx'
import { USER_ROLES } from '../../constants/auth'
import {
  useDashboardKpis,
  useStudents,
  useStaff,
  useTodayAttendance,
  useFeesSummary,
  useExams,
  useNotices,
  useAdmissions,
  useLeaveRequests,
  useCreateStudent,
  useRecordPayment,
  useCreateNotice,
  useApproveLeaveRequest,
  useRejectLeaveRequest,
  useProcessAdmission,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  FormDialog,
  ConfirmDialog,
  Button,
  Input,
  Select,
  Badge,
  LoadingSkeleton,
  ErrorState,
  EmptyState,
} from '../../components/ui'

const AdminDashboard = () => {
  const navigate = useNavigate()

  // State for modals and dialogs
  const [studentsModalOpen, setStudentsModalOpen] = useState(false)
  const [addStudentDialogOpen, setAddStudentDialogOpen] = useState(false)
  const [collectFeesDialogOpen, setCollectFeesDialogOpen] = useState(false)
  const [postNoticeDialogOpen, setPostNoticeDialogOpen] = useState(false)
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState(null)
  const [leaveActionDialog, setLeaveActionDialog] = useState({
    open: false,
    action: null,
  })

  // Fetch dashboard data
  const {
    data: kpis,
    isLoading: kpisLoading,
    error: kpisError,
  } = useDashboardKpis('admin')
  const { data: students = [], isLoading: studentsLoading } = useStudents()
  const { data: staff = [], isLoading: staffLoading } = useStaff()
  const { data: todayAttendance, isLoading: attendanceLoading } =
    useTodayAttendance()
  const { data: feesSummary, isLoading: feesLoading } = useFeesSummary()

  // Fetch data for cards
  const { data: upcomingExams = [] } = useExams({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
  })
  const { data: notices = [] } = useNotices({ limit: 5 })
  const { data: admissions = [] } = useAdmissions({ status: 'pending' })
  const { data: leaveRequests = [] } = useLeaveRequests({ status: 'pending' })

  // Mutations
  const createStudentMutation = useCreateStudent()
  const recordPaymentMutation = useRecordPayment()
  const createNoticeMutation = useCreateNotice()
  const approveLeaveRequestMutation = useApproveLeaveRequest()
  const rejectLeaveRequestMutation = useRejectLeaveRequest()
  const processAdmissionMutation = useProcessAdmission()

  // Generate fee collection chart data
  const feeCollectionData = React.useMemo(() => {
    // Mock daily collection data for the past 7 days
    const data = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        value: Math.floor(Math.random() * 50000) + 20000, // Random collection between 20k-70k
      })
    }
    return data
  }, [])

  // KPI Cards data
  const kpiCards = [
    {
      title: 'Total Students',
      value: kpis?.totalStudents?.toString() || '0',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      description: 'from last month',
      onClick: () => setStudentsModalOpen(true),
    },
    {
      title: 'Teachers & Staff',
      value: kpis?.totalStaff?.toString() || '0',
      change: '+2',
      changeType: 'positive',
      icon: UserCheck,
      description: 'active members',
    },
    {
      title: "Today's Attendance",
      value: todayAttendance ? `${todayAttendance.students.percentage}%` : '0%',
      change: `${todayAttendance?.students.present || 0}/${todayAttendance?.students.total || 0}`,
      changeType: 'neutral',
      icon: Calendar,
      description: 'students present',
    },
    {
      title: 'Fee Collection',
      value: feesSummary ? `${feesSummary.collectionPercentage}%` : '0%',
      change: `₹${feesSummary?.totalPaid?.toLocaleString() || 0}`,
      changeType: 'positive',
      icon: DollarSign,
      description: 'collected this month',
    },
  ]

  // Quick Actions
  const quickActions = [
    {
      id: 'add-student',
      label: 'Add Student',
      icon: UserPlus,
      variant: 'default',
      description: 'Register new student',
      onClick: () => setAddStudentDialogOpen(true),
    },
    {
      id: 'collect-fees',
      label: 'Collect Fees',
      icon: CreditCard,
      variant: 'outline',
      description: 'Record fee payment',
      onClick: () => setCollectFeesDialogOpen(true),
    },
    {
      id: 'post-notice',
      label: 'Post Notice',
      icon: MessageSquare,
      variant: 'outline',
      description: 'Create announcement',
      onClick: () => setPostNoticeDialogOpen(true),
    },
    {
      id: 'approve-leave',
      label: 'Approve Leave',
      icon: CheckCircle,
      variant: 'outline',
      description: 'Review leave requests',
      badge: leaveRequests.length.toString(),
    },
  ]

  // Table columns for different sections
  const admissionColumns = [
    {
      key: 'applicationNumber',
      header: 'Application #',
      sortKey: 'applicationNumber',
    },
    {
      key: 'studentName',
      header: 'Student Name',
      sortKey: 'studentName',
    },
    {
      key: 'classApplied',
      header: 'Class Applied',
      sortKey: 'classApplied',
      render: value => <Badge variant="outline">{value}</Badge>,
    },
    {
      key: 'applicationDate',
      header: 'Applied Date',
      sortKey: 'applicationDate',
      render: value => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleProcessAdmission(row.id, 'approved')}
            loading={processAdmissionMutation.isPending}
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleProcessAdmission(row.id, 'rejected')}
            loading={processAdmissionMutation.isPending}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const leaveRequestColumns = [
    {
      key: 'userId',
      header: 'Applicant',
      render: (value, row) => (
        <div>
          <div className="font-medium">
            {row.userType === 'student' ? 'Student' : 'Staff'}
          </div>
          <div className="text-sm text-gray-500">{row.type} leave</div>
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Duration',
      render: (value, row) => (
        <div className="text-sm">
          {new Date(value).toLocaleDateString()} -{' '}
          {new Date(row.endDate).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: value => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
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
            onClick={() => handleLeaveAction(row, 'approve')}
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleLeaveAction(row, 'reject')}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  // Event handlers
  const handleAddStudent = async event => {
    event.preventDefault()
    const formData = new FormData(event.target)

    try {
      await createStudentMutation.mutateAsync({
        name: formData.get('name'),
        email: formData.get('email'),
        rollNumber: `STU${Date.now()}`,
        admissionNumber: `ADM${Date.now()}`,
        classId: formData.get('classId'),
        section: formData.get('section'),
        dateOfBirth: formData.get('dateOfBirth'),
        gender: formData.get('gender'),
        parentName: formData.get('parentName'),
        parentPhone: formData.get('parentPhone'),
        parentEmail: formData.get('parentEmail'),
        address: formData.get('address'),
        status: 'active',
        admissionDate: new Date().toISOString().split('T')[0],
      })
      setAddStudentDialogOpen(false)
    } catch (error) {
      console.error('Failed to add student:', error)
    }
  }

  const handleCollectFees = async event => {
    event.preventDefault()
    const formData = new FormData(event.target)

    try {
      await recordPaymentMutation.mutateAsync({
        studentId: formData.get('studentId'),
        feeId: 'fee-1', // Default fee type
        amount: parseFloat(formData.get('amount')),
        paymentMethod: formData.get('paymentMethod'),
        receivedBy: 'admin-1', // Current admin
        remarks: formData.get('remarks'),
      })
      setCollectFeesDialogOpen(false)
    } catch (error) {
      console.error('Failed to record payment:', error)
    }
  }

  const handlePostNotice = async event => {
    event.preventDefault()
    const formData = new FormData(event.target)

    try {
      await createNoticeMutation.mutateAsync({
        title: formData.get('title'),
        content: formData.get('content'),
        type: formData.get('type'),
        priority: formData.get('priority'),
        targetAudience: formData.getAll('targetAudience'),
        publishedBy: 'admin-1', // Current admin
        validUntil: formData.get('validUntil'),
        status: 'published',
      })
      setPostNoticeDialogOpen(false)
    } catch (error) {
      console.error('Failed to post notice:', error)
    }
  }

  const handleProcessAdmission = async (id, status) => {
    try {
      await processAdmissionMutation.mutateAsync({
        id,
        status,
        remarks:
          status === 'approved'
            ? 'Application approved'
            : 'Application rejected',
      })
    } catch (error) {
      console.error('Failed to process admission:', error)
    }
  }

  const handleLeaveAction = (request, action) => {
    setSelectedLeaveRequest(request)
    setLeaveActionDialog({ open: true, action })
  }

  const handleLeaveRequestAction = async (remarks = '') => {
    if (!selectedLeaveRequest) return

    try {
      if (leaveActionDialog.action === 'approve') {
        await approveLeaveRequestMutation.mutateAsync({
          id: selectedLeaveRequest.id,
          remarks,
        })
      } else {
        await rejectLeaveRequestMutation.mutateAsync({
          id: selectedLeaveRequest.id,
          remarks,
        })
      }
      setLeaveActionDialog({ open: false, action: null })
      setSelectedLeaveRequest(null)
    } catch (error) {
      console.error('Failed to process leave request:', error)
    }
  }

  // Handle loading states
  if (
    kpisLoading ||
    studentsLoading ||
    staffLoading ||
    attendanceLoading ||
    feesLoading
  ) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              School management overview and controls
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
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            School management overview and controls
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="success" className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>System Online</span>
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.isArray(kpiCards) &&
          kpiCards.map((kpi, index) => (
            <KpiCard
              key={index}
              {...kpi}
              className={
                kpi.onClick
                  ? 'cursor-pointer hover:shadow-lg transition-shadow'
                  : ''
              }
            />
          ))}
      </div>

      {/* Quick Actions */}
      <QuickActions
        title="Quick Actions"
        actions={quickActions}
        variant="card"
        layout="grid"
      />

      {/* Feature Modules */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">System Modules</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Finance Module */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/dashboard/finance/profit-loss')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Calculator className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Finance Management
                  </h3>
                  <p className="text-sm text-gray-600">
                    Income, Expenses & P&L
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-green-600">₹2.5L</div>
                  <div className="text-gray-500">This Month</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-600">85%</div>
                  <div className="text-gray-500">Collection</div>
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
                    navigate('/dashboard/finance/add-expense')
                  }}
                  className="flex-1 bg-red-50 text-red-700 px-3 py-1 rounded text-xs hover:bg-red-100"
                >
                  Add Expense
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Communication Module */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/dashboard/communication/send-message')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Send className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Communication Hub
                  </h3>
                  <p className="text-sm text-gray-600">
                    Messages, Notices & Alerts
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <div className="text-center">
                  <div className="font-bold text-green-600">📱 WA</div>
                  <div className="text-xs text-gray-500">WhatsApp</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-600">📧 Email</div>
                  <div className="text-xs text-gray-500">Email</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-purple-600">💬 SMS</div>
                  <div className="text-xs text-gray-500">SMS</div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={e => {
                    e.stopPropagation()
                    navigate('/dashboard/communication/notice-board')
                  }}
                  className="flex-1 bg-blue-50 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-100"
                >
                  Notice Board
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    navigate('/dashboard/communication/log')
                  }}
                  className="flex-1 bg-gray-50 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-100"
                >
                  View Logs
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Homework Module */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/dashboard/homework/daily')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Homework Management
                  </h3>
                  <p className="text-sm text-gray-600">
                    Assignments & Submissions
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-orange-600">24</div>
                  <div className="text-gray-500">Active</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-600">78%</div>
                  <div className="text-gray-500">Submitted</div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={e => {
                    e.stopPropagation()
                    navigate('/dashboard/homework/add')
                  }}
                  className="flex-1 bg-orange-50 text-orange-700 px-3 py-1 rounded text-xs hover:bg-orange-100"
                >
                  Add Homework
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    navigate('/dashboard/homework/daily')
                  }}
                  className="flex-1 bg-blue-50 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-100"
                >
                  Track Daily
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Lesson Plan Module */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/dashboard/lessonplan/manage')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Lesson Planning
                  </h3>
                  <p className="text-sm text-gray-600">
                    Plans, Topics & Syllabus
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-purple-600">156</div>
                  <div className="text-gray-500">Lessons</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-600">92%</div>
                  <div className="text-gray-500">Syllabus</div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={e => {
                    e.stopPropagation()
                    navigate('/dashboard/lessonplan/lessons')
                  }}
                  className="flex-1 bg-purple-50 text-purple-700 px-3 py-1 rounded text-xs hover:bg-purple-100"
                >
                  Add Lesson
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    navigate('/dashboard/lessonplan/syllabus-status')
                  }}
                  className="flex-1 bg-green-50 text-green-700 px-3 py-1 rounded text-xs hover:bg-green-100"
                >
                  Syllabus Status
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <button
            onClick={() => navigate('/dashboard/finance/income-head')}
            className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <PieChart className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-sm font-medium">Income Heads</div>
          </button>

          <button
            onClick={() => navigate('/dashboard/finance/expense-head')}
            className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <BarChart3 className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <div className="text-sm font-medium">Expense Heads</div>
          </button>

          <button
            onClick={() => navigate('/dashboard/communication/template-email')}
            className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <Mail className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-sm font-medium">Email Templates</div>
          </button>

          <button
            onClick={() => navigate('/dashboard/communication/template-sms')}
            className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <Phone className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-sm font-medium">SMS Templates</div>
          </button>

          <button
            onClick={() => navigate('/dashboard/lessonplan/topics')}
            className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <Target className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <div className="text-sm font-medium">Topics</div>
          </button>

          <button
            onClick={() => navigate('/dashboard/lessonplan/copy-old')}
            className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <Copy className="h-6 w-6 text-gray-600 mx-auto mb-2" />
            <div className="text-sm font-medium">Copy Lessons</div>
          </button>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          title="Fee Collection Trend"
          description="Daily fee collection for the past week"
          data={feeCollectionData}
          type="bar"
          color="#10b981"
          formatTooltip={value => [`₹${value.toLocaleString()}`, 'Collection']}
          formatYAxis={value => `₹${(value / 1000).toFixed(0)}k`}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Latest Notices</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notices.length === 0 ? (
              <EmptyState
                title="No Notices"
                description="No notices have been posted recently."
                variant="default"
              />
            ) : (
              <div className="space-y-4">
                {notices.slice(0, 5).map(notice => (
                  <div
                    key={notice.id}
                    className="border-l-4 border-blue-500 pl-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {notice.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notice.content}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge
                            variant={
                              notice.priority === 'high'
                                ? 'danger'
                                : notice.priority === 'medium'
                                  ? 'warning'
                                  : 'secondary'
                            }
                            size="sm"
                          >
                            {notice.priority}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(notice.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Recent Admissions</span>
              </div>
              <Badge variant="outline">{admissions.length} pending</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {admissions.length === 0 ? (
              <EmptyState
                title="No Pending Admissions"
                description="All admission applications have been processed."
                variant="default"
              />
            ) : (
              <DataTable
                data={admissions.slice(0, 5)}
                columns={admissionColumns}
                sortable={false}
                paginated={false}
                emptyMessage="No admission applications found"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Pending Leave Requests</span>
              </div>
              <Badge variant="outline">{leaveRequests.length} pending</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaveRequests.length === 0 ? (
              <EmptyState
                title="No Pending Requests"
                description="All leave requests have been processed."
                variant="default"
              />
            ) : (
              <DataTable
                data={leaveRequests.slice(0, 5)}
                columns={leaveRequestColumns}
                sortable={false}
                paginated={false}
                emptyMessage="No leave requests found"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Students Modal */}
      <Dialog open={studentsModalOpen} onOpenChange={setStudentsModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Students by Class</DialogTitle>
            <DialogClose onClose={() => setStudentsModalOpen(false)} />
          </DialogHeader>
          <div className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 10 }, (_, i) => {
                const classStudents = students.filter(
                  s => s.classId === `class-${i + 1}`
                )
                return (
                  <div
                    key={i}
                    className="bg-gray-50 rounded-lg p-4 text-center"
                  >
                    <div className="text-2xl font-bold text-blue-600">
                      {classStudents.length}
                    </div>
                    <div className="text-sm text-gray-600">Class {i + 1}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <FormDialog
        open={addStudentDialogOpen}
        onOpenChange={setAddStudentDialogOpen}
        title="Add New Student"
        description="Register a new student in the system"
        onSubmit={handleAddStudent}
        submitLabel="Add Student"
        loading={createStudentMutation.isPending}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="name"
            label="Student Name"
            placeholder="Enter full name"
            required
          />
          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="student@school.edu"
            required
          />
          <Select name="classId" label="Class" required>
            <option value="">Select Class</option>
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i} value={`class-${i + 1}`}>
                Class {i + 1}
              </option>
            ))}
          </Select>
          <Select name="section" label="Section" required>
            <option value="">Select Section</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </Select>
          <Input
            name="dateOfBirth"
            type="date"
            label="Date of Birth"
            required
          />
          <Select name="gender" label="Gender" required>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </Select>
          <Input
            name="parentName"
            label="Parent Name"
            placeholder="Enter parent name"
            required
          />
          <Input
            name="parentPhone"
            label="Parent Phone"
            placeholder="+1-555-0000"
            required
          />
          <Input
            name="parentEmail"
            type="email"
            label="Parent Email"
            placeholder="parent@email.com"
            required
          />
          <Input
            name="address"
            label="Address"
            placeholder="Enter address"
            className="md:col-span-2"
          />
        </div>
      </FormDialog>

      {/* Collect Fees Dialog */}
      <FormDialog
        open={collectFeesDialogOpen}
        onOpenChange={setCollectFeesDialogOpen}
        title="Collect Fee Payment"
        description="Record a fee payment from a student"
        onSubmit={handleCollectFees}
        submitLabel="Record Payment"
        loading={recordPaymentMutation.isPending}
      >
        <div className="space-y-4">
          <Select name="studentId" label="Student" required>
            <option value="">Select Student</option>
            {students.slice(0, 10).map(student => (
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
            required
          />
          <Select name="paymentMethod" label="Payment Method" required>
            <option value="">Select Method</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="online">Online Transfer</option>
            <option value="cheque">Cheque</option>
          </Select>
          <Input
            name="remarks"
            label="Remarks"
            placeholder="Optional remarks"
          />
        </div>
      </FormDialog>

      {/* Post Notice Dialog */}
      <FormDialog
        open={postNoticeDialogOpen}
        onOpenChange={setPostNoticeDialogOpen}
        title="Post New Notice"
        description="Create and publish a new notice"
        onSubmit={handlePostNotice}
        submitLabel="Post Notice"
        loading={createNoticeMutation.isPending}
      >
        <div className="space-y-4">
          <Input
            name="title"
            label="Notice Title"
            placeholder="Enter notice title"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              name="content"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter notice content"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select name="type" label="Type" required>
              <option value="">Select Type</option>
              <option value="general">General</option>
              <option value="academic">Academic</option>
              <option value="event">Event</option>
              <option value="urgent">Urgent</option>
            </Select>
            <Select name="priority" label="Priority" required>
              <option value="">Select Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience
            </label>
            <div className="space-y-2">
              {['student', 'parent', 'staff'].map(audience => (
                <label key={audience} className="flex items-center">
                  <input
                    type="checkbox"
                    name="targetAudience"
                    value={audience}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">
                    {audience}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <Input name="validUntil" type="date" label="Valid Until" required />
        </div>
      </FormDialog>

      {/* Leave Request Action Dialog */}
      <ConfirmDialog
        open={leaveActionDialog.open}
        onOpenChange={open =>
          setLeaveActionDialog({ ...leaveActionDialog, open })
        }
        title={`${leaveActionDialog.action === 'approve' ? 'Approve' : 'Reject'} Leave Request`}
        description={`Are you sure you want to ${leaveActionDialog.action} this leave request?`}
        confirmLabel={
          leaveActionDialog.action === 'approve' ? 'Approve' : 'Reject'
        }
        cancelLabel="Cancel"
        variant={
          leaveActionDialog.action === 'reject' ? 'destructive' : 'default'
        }
        onConfirm={() => handleLeaveRequestAction()}
        loading={
          approveLeaveRequestMutation.isPending ||
          rejectLeaveRequestMutation.isPending
        }
      />
    </div>
  )
}

export default withRoleGuard([USER_ROLES.ADMIN])(AdminDashboard)
