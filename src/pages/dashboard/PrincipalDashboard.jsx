import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  UserCheck,
  TrendingUp,
  DollarSign,
  Calendar,
  BookOpen,
  BarChart3,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  Award,
  Bell,
  MessageSquare,
  FileText,
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
  useExamResults,
  useLeaveRequests,
  useAdmissions,
  useNoticesByAudience,
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
  ConfirmDialog,
  Button,
  Badge,
  LoadingSkeleton,
  ErrorState,
  EmptyState,
} from '../../components/ui'

const PrincipalDashboard = () => {
  const navigate = useNavigate()

  // State for dialogs
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [actionType, setActionType] = useState(null)

  // Fetch dashboard data
  const {
    data: kpis,
    isLoading: kpisLoading,
    error: kpisError,
  } = useDashboardKpis('principal')
  const { data: students = [] } = useStudents()
  const { data: staff = [] } = useStaff()
  const { data: todayAttendance } = useTodayAttendance()
  const { data: feesSummary } = useFeesSummary()
  const { data: exams = [] } = useExams()
  const { data: examResults = [] } = useExamResults()
  const { data: leaveRequests = [] } = useLeaveRequests({ status: 'pending' })
  const { data: admissions = [] } = useAdmissions({ status: 'pending' })
  const { data: notices = [] } = useNoticesByAudience('staff')

  // Mutations
  const approveLeaveRequestMutation = useApproveLeaveRequest()
  const rejectLeaveRequestMutation = useRejectLeaveRequest()
  const processAdmissionMutation = useProcessAdmission()

  // Generate attendance trend data (last 7 days)
  const attendanceTrendData = React.useMemo(() => {
    const data = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      // Mock attendance data - in real app, this would come from API
      const attendance = 85 + Math.random() * 10 // 85-95% range

      data.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        value: Math.round(attendance),
      })
    }
    return data
  }, [])

  // Generate exam performance data
  const examPerformanceData = React.useMemo(() => {
    return [
      { name: 'A+', value: 15 },
      { name: 'A', value: 25 },
      { name: 'B+', value: 30 },
      { name: 'B', value: 20 },
      { name: 'C+', value: 8 },
      { name: 'C', value: 2 },
    ]
  }, [])

  // Mock upcoming events
  const upcomingEvents = [
    {
      id: 1,
      title: 'Annual Sports Day',
      date: '2024-03-15',
      type: 'Sports',
      description: 'Inter-house sports competition',
    },
    {
      id: 2,
      title: 'Parent-Teacher Meeting',
      date: '2024-02-28',
      type: 'Academic',
      description: 'Quarterly PTM for all classes',
    },
    {
      id: 3,
      title: 'Science Exhibition',
      date: '2024-03-10',
      type: 'Academic',
      description: 'Student science project showcase',
    },
  ]

  // KPI Cards data
  const kpiCards = [
    {
      title: 'Total Students',
      value: kpis?.totalStudents?.toString() || students.length.toString(),
      change: '+12',
      changeType: 'positive',
      icon: Users,
      description: 'active students',
    },
    {
      title: 'Total Teachers',
      value:
        kpis?.totalTeachers?.toString() ||
        staff.filter(s => s.role === 'teacher').length.toString(),
      change: '+2',
      changeType: 'positive',
      icon: UserCheck,
      description: 'teaching staff',
    },
    {
      title: 'Attendance Rate',
      value: todayAttendance ? `${todayAttendance.students.percentage}%` : '0%',
      change: '+2.5%',
      changeType: 'positive',
      icon: TrendingUp,
      description: 'from last week',
    },
    {
      title: 'Fee Collection',
      value: feesSummary ? `${feesSummary.collectionPercentage}%` : '0%',
      change: `₹${feesSummary?.totalPaid?.toLocaleString() || 0}`,
      changeType: 'positive',
      icon: DollarSign,
      description: 'collected',
    },
  ]

  // Quick Actions
  const quickActions = [
    {
      id: 'approve-requests',
      label: 'Approve Requests',
      icon: CheckCircle,
      variant: 'default',
      description: 'Review pending approvals',
      badge: (leaveRequests.length + admissions.length).toString(),
    },
    {
      id: 'view-reports',
      label: 'View Reports',
      icon: BarChart3,
      variant: 'outline',
      description: 'Academic & financial reports',
    },
    {
      id: 'schedule-meeting',
      label: 'Schedule Meeting',
      icon: Calendar,
      variant: 'outline',
      description: 'Plan staff meetings',
    },
    {
      id: 'send-announcement',
      label: 'Send Announcement',
      icon: Bell,
      variant: 'outline',
      description: 'School-wide notifications',
    },
  ]

  // Table columns for exam performance
  const examPerformanceColumns = [
    {
      key: 'subject',
      header: 'Subject',
      render: () => 'Mathematics', // Mock data
    },
    {
      key: 'class',
      header: 'Class',
      render: () => 'Class 10',
    },
    {
      key: 'totalStudents',
      header: 'Students',
      render: () => '30',
    },
    {
      key: 'averageMarks',
      header: 'Average',
      render: () => '78.5',
    },
    {
      key: 'passPercentage',
      header: 'Pass %',
      render: () => <Badge variant="success">92%</Badge>,
    },
    {
      key: 'topScore',
      header: 'Top Score',
      render: () => '95',
    },
  ]

  // Table columns for approvals
  const approvalsColumns = [
    {
      key: 'type',
      header: 'Type',
      render: (_, row) => (
        <Badge variant={row.type === 'leave' ? 'info' : 'warning'}>
          {row.type === 'leave' ? 'Leave Request' : 'Admission'}
        </Badge>
      ),
    },
    {
      key: 'applicant',
      header: 'Applicant',
      render: (_, row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-sm text-gray-500">{row.details}</div>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (_, row) => new Date(row.date).toLocaleDateString(),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (_, row) => (
        <Badge
          variant={
            row.priority === 'high'
              ? 'danger'
              : row.priority === 'medium'
                ? 'warning'
                : 'secondary'
          }
        >
          {row.priority}
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
            onClick={() => handleApproval(row, 'approve')}
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleApproval(row, 'reject')}
          >
            <XCircle className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewDetails(row)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  // Combine leave requests and admissions for approvals table
  const pendingApprovals = React.useMemo(() => {
    const leaveApprovals = leaveRequests.map(request => ({
      id: request.id,
      type: 'leave',
      name: request.userType === 'student' ? 'Student' : 'Staff Member',
      details: `${request.type} leave - ${request.reason}`,
      date: request.appliedAt,
      priority: 'medium',
      originalData: request,
    }))

    const admissionApprovals = admissions.map(admission => ({
      id: admission.id,
      type: 'admission',
      name: admission.studentName,
      details: `${admission.classApplied} - ${admission.fatherName}`,
      date: admission.applicationDate,
      priority: 'high',
      originalData: admission,
    }))

    return [...leaveApprovals, ...admissionApprovals]
  }, [leaveRequests, admissions])

  // Mock exam performance data for table
  const examPerformanceTableData = [
    {
      subject: 'Mathematics',
      class: 'Class 10',
      totalStudents: 30,
      averageMarks: 78.5,
      passPercentage: 92,
      topScore: 95,
    },
    {
      subject: 'English',
      class: 'Class 10',
      totalStudents: 30,
      averageMarks: 82.3,
      passPercentage: 96,
      topScore: 98,
    },
    {
      subject: 'Physics',
      class: 'Class 10',
      totalStudents: 30,
      averageMarks: 75.8,
      passPercentage: 88,
      topScore: 94,
    },
  ]

  // Event handlers
  const handleApproval = (request, action) => {
    setSelectedRequest(request)
    setActionType(action)
    setApprovalDialogOpen(true)
  }

  const handleViewDetails = request => {
    // Implementation for viewing details
    console.log('View details:', request)
  }

  const handleConfirmApproval = async () => {
    if (!selectedRequest) return

    try {
      if (selectedRequest.type === 'leave') {
        if (actionType === 'approve') {
          await approveLeaveRequestMutation.mutateAsync({
            id: selectedRequest.id,
            remarks: 'Approved by Principal',
          })
        } else {
          await rejectLeaveRequestMutation.mutateAsync({
            id: selectedRequest.id,
            remarks: 'Rejected by Principal',
          })
        }
      } else if (selectedRequest.type === 'admission') {
        await processAdmissionMutation.mutateAsync({
          id: selectedRequest.id,
          status: actionType === 'approve' ? 'approved' : 'rejected',
          remarks: `${actionType === 'approve' ? 'Approved' : 'Rejected'} by Principal`,
        })
      }

      setApprovalDialogOpen(false)
      setSelectedRequest(null)
      setActionType(null)
    } catch (error) {
      console.error('Failed to process approval:', error)
    }
  }

  // Handle loading states
  if (kpisLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Principal Dashboard
            </h1>
            <p className="text-gray-600">School oversight and management</p>
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
            Principal Dashboard
          </h1>
          <p className="text-gray-600">School oversight and management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="info" className="flex items-center space-x-1">
            <Award className="h-3 w-3" />
            <span>Excellence Award 2023</span>
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

      {/* Management Modules */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">
          School Management
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Academic Management */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/dashboard/lessonplan/manage')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1 ">
                  <h3 className="font-semibold text-gray-900">
                    Academic Management
                  </h3>
                  <p className="text-sm text-gray-600">
                    Lesson Plans & Syllabus
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
                  <div className="text-gray-500">Complete</div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={e => {
                    e.stopPropagation()
                    navigate('/dashboard/lessonplan/syllabus-status')
                  }}
                  className="flex-1 bg-purple-50 text-purple-700 px-3 py-1 rounded text-xs hover:bg-purple-100"
                >
                  Syllabus Status
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Communication Hub */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/dashboard/communication/send-message')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Communication</h3>
                  <p className="text-sm text-gray-600">Messages & Notices</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <div className="text-center">
                  <div className="font-bold text-green-600">📱</div>
                  <div className="text-xs text-gray-500">WhatsApp</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-600">📧</div>
                  <div className="text-xs text-gray-500">Email</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-purple-600">💬</div>
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
              </div>
            </CardContent>
          </Card>

          {/* Homework Tracking */}
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
                    Homework Tracking
                  </h3>
                  <p className="text-sm text-gray-600">Monitor Assignments</p>
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
                    navigate('/dashboard/homework/daily')
                  }}
                  className="flex-1 bg-orange-50 text-orange-700 px-3 py-1 rounded text-xs hover:bg-orange-100"
                >
                  Track Daily
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Finance Overview */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/dashboard/finance/profit-loss')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Finance Overview
                  </h3>
                  <p className="text-sm text-gray-600">P&L & Reports</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-green-600">₹2.5L</div>
                  <div className="text-gray-500">Income</div>
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
                    navigate('/dashboard/finance/profit-loss')
                  }}
                  className="flex-1 bg-green-50 text-green-700 px-3 py-1 rounded text-xs hover:bg-green-100"
                >
                  P&L Report
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Management Tools */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <button
            onClick={() => navigate('/dashboard/lessonplan/manage')}
            className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <BookOpen className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-sm font-medium">Lesson Plans</div>
          </button>

          <button
            onClick={() => navigate('/dashboard/communication/log')}
            className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <MessageSquare className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-sm font-medium">Message Logs</div>
          </button>

          <button
            onClick={() => navigate('/dashboard/finance/search-income')}
            className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-sm font-medium">Income Reports</div>
          </button>

          <button
            onClick={() => navigate('/dashboard/finance/search-expense')}
            className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <DollarSign className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <div className="text-sm font-medium">Expense Reports</div>
          </button>

          <button
            onClick={() =>
              navigate('/dashboard/communication/send-credentials')
            }
            className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <Users className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <div className="text-sm font-medium">Send Credentials</div>
          </button>

          <button
            onClick={() => navigate('/dashboard/lessonplan/syllabus-status')}
            className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-sm font-medium">Syllabus Status</div>
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          title="Attendance Trends"
          description="School-wide attendance for the past 7 days"
          data={attendanceTrendData}
          type="line"
          color="#3b82f6"
          formatTooltip={value => [`${value}%`, 'Attendance']}
        />

        <TrendChart
          title="Exam Performance Distribution"
          description="Grade distribution across all subjects"
          data={examPerformanceData}
          type="pie"
          colors={[
            '#10b981',
            '#3b82f6',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6',
            '#6b7280',
          ]}
          formatTooltip={value => [`${value} students`, 'Count']}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exam Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Exam Performance Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={examPerformanceTableData}
              columns={examPerformanceColumns}
              sortable={true}
              paginated={false}
              emptyMessage="No exam data available"
            />
          </CardContent>
        </Card>

        {/* Upcoming School Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Upcoming School Events</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(upcomingEvents) &&
                upcomingEvents.map(event => (
                  <div
                    key={event.id}
                    className="border-l-4 border-blue-500 pl-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {event.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {event.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">{event.type}</Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approvals Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Pending Approvals</span>
            </div>
            <Badge variant="warning">{pendingApprovals.length} pending</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length === 0 ? (
            <EmptyState
              title="No Pending Approvals"
              description="All requests have been processed."
              variant="default"
            />
          ) : (
            <DataTable
              data={pendingApprovals}
              columns={approvalsColumns}
              sortable={true}
              paginated={true}
              emptyMessage="No pending approvals"
            />
          )}
        </CardContent>
      </Card>

      {/* School Notices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Recent School Notices</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notices.length === 0 ? (
            <EmptyState
              title="No Notices"
              description="No recent notices available."
              variant="default"
            />
          ) : (
            <div className="space-y-4">
              {notices.slice(0, 5).map(notice => (
                <div
                  key={notice.id}
                  className="border-l-4 border-yellow-500 pl-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {notice.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {notice.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notice.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Confirmation Dialog */}
      <ConfirmDialog
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
        title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Request`}
        description={`Are you sure you want to ${actionType} this ${selectedRequest?.type} request?`}
        confirmLabel={actionType === 'approve' ? 'Approve' : 'Reject'}
        cancelLabel="Cancel"
        variant={actionType === 'reject' ? 'destructive' : 'default'}
        onConfirm={handleConfirmApproval}
        loading={
          approveLeaveRequestMutation.isPending ||
          rejectLeaveRequestMutation.isPending ||
          processAdmissionMutation.isPending
        }
      />
    </div>
  )
}

export default withRoleGuard([USER_ROLES.PRINCIPAL])(PrincipalDashboard)
