import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  ClipboardList,
  DollarSign,
  BookOpen,
  FileText,
  Download,
  Eye,
  CreditCard,
  Bell,
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import { withRoleGuard } from '../../guards/withRoleGuard.jsx'
import { USER_ROLES } from '../../constants/auth'
import {
  useDashboardKpis,
  useStudentHomework,
  useStudentFees,
  useStudentAttendance,
  useExamResults,
  useNoticesByAudience,
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

const StudentDashboard = () => {
  const navigate = useNavigate()

  // State for dialogs
  const [payFeesDialogOpen, setPayFeesDialogOpen] = useState(false)
  const [viewResultsDialogOpen, setViewResultsDialogOpen] = useState(false)

  // Mock current student ID - in real app, this would come from auth context
  const currentStudentId = 'student-1'

  // Fetch dashboard data
  const {
    data: kpis,
    isLoading: kpisLoading,
    error: kpisError,
  } = useDashboardKpis('student')
  const { data: homework = [] } = useStudentHomework(currentStudentId)
  const { data: studentFees } = useStudentFees(currentStudentId)
  const { data: notices = [] } = useNoticesByAudience('student')

  // Get attendance for current month
  const currentMonth = new Date()
  const startOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  )
  const { data: attendanceRecords = [] } = useStudentAttendance(
    currentStudentId,
    {
      start: startOfMonth.toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    }
  )

  // Get exam results
  const { data: examResults = [] } = useExamResults(null, currentStudentId)

  // Mutations
  const recordPaymentMutation = useRecordPayment()

  // Calculate attendance percentage
  const attendancePercentage = React.useMemo(() => {
    if (attendanceRecords.length === 0) return 0
    const presentDays = attendanceRecords.filter(
      record => record.status === 'present'
    ).length
    return ((presentDays / attendanceRecords.length) * 100).toFixed(1)
  }, [attendanceRecords])

  // Mock today's classes
  const todayClasses = [
    {
      time: '09:00 - 09:45',
      subject: 'Mathematics',
      teacher: 'Mr. Smith',
      room: 'Room 201',
    },
    {
      time: '09:45 - 10:30',
      subject: 'English',
      teacher: 'Ms. Davis',
      room: 'Room 105',
    },
    {
      time: '11:00 - 11:45',
      subject: 'Physics',
      teacher: 'Dr. Brown',
      room: 'Lab 3',
    },
    {
      time: '11:45 - 12:30',
      subject: 'Chemistry',
      teacher: 'Dr. Wilson',
      room: 'Lab 1',
    },
    {
      time: '14:00 - 14:45',
      subject: 'History',
      teacher: 'Mr. Johnson',
      room: 'Room 301',
    },
  ]

  // Mock upcoming exams
  const upcomingExams = [
    {
      id: 1,
      subject: 'Mathematics',
      date: '2024-02-15',
      time: '09:00 AM',
      duration: '3 hours',
      syllabus: 'Chapters 1-5: Algebra, Geometry',
      type: 'Mid-term',
    },
    {
      id: 2,
      subject: 'Physics',
      date: '2024-02-18',
      time: '10:00 AM',
      duration: '2 hours',
      syllabus: 'Chapters 1-3: Mechanics, Waves',
      type: 'Unit Test',
    },
  ]

  // KPI Cards data
  const kpiCards = [
    {
      title: 'Attendance %',
      value: `${attendancePercentage}%`,
      change: `${attendanceRecords.filter(r => r.status === 'present').length}/${attendanceRecords.length}`,
      changeType:
        parseFloat(attendancePercentage) >= 75 ? 'positive' : 'negative',
      icon: Calendar,
      description: 'this month',
    },
    {
      title: 'Assignments Due',
      value: homework.filter(hw => hw.status === 'pending').length.toString(),
      change: `${homework.length} total`,
      changeType:
        homework.filter(hw => hw.status === 'pending').length > 0
          ? 'negative'
          : 'positive',
      icon: ClipboardList,
      description: 'pending',
    },
    {
      title: 'Fee Dues',
      value: `₹${studentFees?.totalPending?.toLocaleString() || 0}`,
      change: studentFees?.totalPaid
        ? `₹${studentFees.totalPaid.toLocaleString()} paid`
        : 'No payments',
      changeType: studentFees?.totalPending > 0 ? 'negative' : 'positive',
      icon: DollarSign,
      description: 'outstanding',
    },
    {
      title: 'Overall GPA',
      value: kpis?.attendanceRate ? `${kpis.attendanceRate}%` : '0%',
      change: '+2.5%',
      changeType: 'positive',
      icon: TrendingUp,
      description: 'from last term',
    },
  ]

  // Quick Actions
  const quickActions = [
    {
      id: 'download-admit-card',
      label: 'Download Admit Card',
      icon: Download,
      variant: 'default',
      description: 'Get exam admit card',
    },
    {
      id: 'view-results',
      label: 'View Results',
      icon: Eye,
      variant: 'outline',
      description: 'Check exam results',
      onClick: () => setViewResultsDialogOpen(true),
    },
    {
      id: 'pay-fees',
      label: 'Pay Fees',
      icon: CreditCard,
      variant: 'outline',
      description: 'Make fee payment',
      onClick: () => setPayFeesDialogOpen(true),
      badge: studentFees?.totalPending > 0 ? '!' : '',
    },
  ]

  // Table columns for homework
  const homeworkColumns = [
    {
      key: 'title',
      header: 'Assignment',
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.subjectId}</div>
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: value => new Date(value).toLocaleDateString(),
    },
    {
      key: 'status',
      header: 'Status',
      render: value => (
        <Badge
          variant={
            value === 'submitted'
              ? 'success'
              : value === 'pending'
                ? 'warning'
                : 'secondary'
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <Button
          size="sm"
          variant="outline"
          disabled={row.status === 'submitted'}
        >
          {row.status === 'submitted' ? 'Submitted' : 'Submit'}
        </Button>
      ),
    },
  ]

  // Table columns for fee payments
  const feeColumns = [
    {
      key: 'feeId',
      header: 'Fee Type',
      render: () => 'Tuition Fee',
    },
    {
      key: 'amount',
      header: 'Amount',
      render: value => `₹${value.toLocaleString()}`,
    },
    {
      key: 'paymentDate',
      header: 'Date',
      render: value =>
        value ? new Date(value).toLocaleDateString() : 'Pending',
    },
    {
      key: 'status',
      header: 'Status',
      render: value => (
        <Badge variant={value === 'paid' ? 'success' : 'warning'}>
          {value}
        </Badge>
      ),
    },
  ]

  // Event handlers
  const handlePayFees = async event => {
    event.preventDefault()
    const formData = new FormData(event.target)

    try {
      await recordPaymentMutation.mutateAsync({
        studentId: currentStudentId,
        feeId: 'fee-1',
        amount: parseFloat(formData.get('amount')),
        paymentMethod: formData.get('paymentMethod'),
        receivedBy: 'system',
        remarks: 'Online payment by student',
      })
      setPayFeesDialogOpen(false)
    } catch (error) {
      console.error('Failed to record payment:', error)
    }
  }

  // Generate attendance chart data
  const attendanceChartData = React.useMemo(() => {
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const record = attendanceRecords.find(r => r.date === dateStr)

      last7Days.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        value: record?.status === 'present' ? 1 : 0,
      })
    }
    return last7Days
  }, [attendanceRecords])

  // Handle loading states
  if (kpisLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Student Dashboard
            </h1>
            <p className="text-gray-600">
              Track your academic progress and activities
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
            Student Dashboard
          </h1>
          <p className="text-gray-600">
            Track your academic progress and activities
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="info" className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Academic Year 2023-24</span>
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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

      {/* Student Tools */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Student Tools</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Homework Submissions */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/dashboard/homework/daily')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <ClipboardList className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">My Homework</h3>
                  <p className="text-sm text-gray-600">
                    View & Submit Assignments
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-orange-600">
                    {homework.filter(hw => hw.status === 'pending').length}
                  </div>
                  <div className="text-gray-500">Pending</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-600">
                    {homework.filter(hw => hw.status === 'submitted').length}
                  </div>
                  <div className="text-gray-500">Submitted</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-xs text-gray-500">
                  Track your assignment progress
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Study Materials */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Study Materials
                  </h3>
                  <p className="text-sm text-gray-600">
                    Access Lesson Resources
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-blue-600">28</div>
                  <div className="text-gray-500">Lessons</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-purple-600">15</div>
                  <div className="text-gray-500">Topics</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-xs text-gray-500">
                  Download study materials
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notices & Updates */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Bell className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Notices & Updates
                  </h3>
                  <p className="text-sm text-gray-600">School Announcements</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-green-600">
                    {notices.length}
                  </div>
                  <div className="text-gray-500">New</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-600">5</div>
                  <div className="text-gray-500">Important</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-xs text-gray-500">
                  Stay updated with school news
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Today's Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Today's Classes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.isArray(todayClasses) &&
                todayClasses.map((classItem, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {classItem.subject}
                      </div>
                      <div className="text-sm text-gray-600">
                        {classItem.teacher} - {classItem.room}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-blue-600">
                      {classItem.time}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Exams & Syllabus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Upcoming Exams & Syllabus</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(upcomingExams) &&
                upcomingExams.map(exam => (
                  <div key={exam.id} className="border-l-4 border-red-500 pl-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {exam.subject}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {exam.syllabus}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>
                            {new Date(exam.date).toLocaleDateString()}
                          </span>
                          <span>{exam.time}</span>
                          <span>{exam.duration}</span>
                        </div>
                      </div>
                      <Badge variant="danger" size="sm">
                        {exam.type}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Homework Due */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ClipboardList className="h-5 w-5" />
                <span>Homework Due</span>
              </div>
              <Badge variant="outline">
                {homework.filter(hw => hw.status === 'pending').length} pending
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {homework.length === 0 ? (
              <EmptyState
                title="No Homework"
                description="You have no homework assignments at the moment."
                variant="courses"
              />
            ) : (
              <DataTable
                data={homework.slice(0, 5)}
                columns={homeworkColumns}
                sortable={false}
                paginated={false}
                emptyMessage="No homework found"
              />
            )}
          </CardContent>
        </Card>

        {/* Fee Dues & Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Fee Dues & Payments</span>
              </div>
              {studentFees?.totalPending > 0 && (
                <Badge variant="warning">
                  ₹{studentFees.totalPending.toLocaleString()} due
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!studentFees || studentFees.payments.length === 0 ? (
              <EmptyState
                title="No Payment History"
                description="No fee payments recorded yet."
                variant="financial"
              />
            ) : (
              <DataTable
                data={studentFees.payments.slice(0, 5)}
                columns={feeColumns}
                sortable={false}
                paginated={false}
                emptyMessage="No payment history found"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts and Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Attendance Trend */}
        <TrendChart
          title="Weekly Attendance"
          description="Your attendance for the past 7 days"
          data={attendanceChartData}
          type="bar"
          color="#10b981"
          formatTooltip={value => [
            value === 1 ? 'Present' : 'Absent',
            'Status',
          ]}
        />

        {/* Notices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Recent Notices</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notices.length === 0 ? (
              <EmptyState
                title="No Notices"
                description="No recent notices for students."
                variant="default"
              />
            ) : (
              <div className="space-y-4">
                {notices.slice(0, 4).map(notice => (
                  <div
                    key={notice.id}
                    className="border-l-4 border-blue-500 pl-4"
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
      </div>

      {/* Pay Fees Dialog */}
      <FormDialog
        open={payFeesDialogOpen}
        onOpenChange={setPayFeesDialogOpen}
        title="Pay Fees"
        description="Make a fee payment online"
        onSubmit={handlePayFees}
        submitLabel="Pay Now"
        loading={recordPaymentMutation.isPending}
      >
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Outstanding Amount:</span>
              <span className="text-lg font-bold text-red-600">
                ₹{studentFees?.totalPending?.toLocaleString() || 0}
              </span>
            </div>
          </div>
          <Input
            name="amount"
            type="number"
            label="Amount to Pay"
            placeholder="5000"
            defaultValue={studentFees?.totalPending}
            required
          />
          <Select name="paymentMethod" label="Payment Method" required>
            <option value="">Select Payment Method</option>
            <option value="card">Credit/Debit Card</option>
            <option value="online">Net Banking</option>
            <option value="upi">UPI</option>
            <option value="wallet">Digital Wallet</option>
          </Select>
        </div>
      </FormDialog>

      {/* View Results Dialog */}
      <FormDialog
        open={viewResultsDialogOpen}
        onOpenChange={setViewResultsDialogOpen}
        title="Exam Results"
        description="Your recent exam results and grades"
        submitLabel="Close"
        onSubmit={() => setViewResultsDialogOpen(false)}
      >
        <div className="space-y-4">
          {examResults.length === 0 ? (
            <EmptyState
              title="No Results"
              description="No exam results available yet."
              variant="default"
            />
          ) : (
            examResults.map(result => (
              <div key={result.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">Mathematics Mid-term</h4>
                    <p className="text-sm text-gray-600">Total Marks: 100</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {result.marksObtained}
                    </div>
                    <div className="text-sm text-gray-500">
                      Grade: {result.grade}
                    </div>
                  </div>
                </div>
                {result.remarks && (
                  <p className="text-sm text-gray-600 mt-2">{result.remarks}</p>
                )}
              </div>
            ))
          )}
        </div>
      </FormDialog>
    </div>
  )
}

export default withRoleGuard([USER_ROLES.STUDENT])(StudentDashboard)
