import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  DollarSign,
  Calendar,
  FileText,
  ClipboardList,
  Bell,
  Download,
  Eye,
  Clock,
  TrendingUp,
  AlertCircle,
  BookOpen,
} from 'lucide-react'
import { withRoleGuard } from '../../guards/withRoleGuard.jsx'
import { USER_ROLES } from '../../constants/auth'
import {
  useDashboardKpis,
  useStudents,
  useStudentFees,
  useStudentAttendance,
  useExamResults,
  useStudentHomework,
  useNoticesByAudience,
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
  Button,
  Badge,
  LoadingSkeleton,
  ErrorState,
  EmptyState,
} from '../../components/ui'

const ParentDashboard = () => {
  const navigate = useNavigate()

  // State for dialogs
  const [reportCardDialogOpen, setReportCardDialogOpen] = useState(false)
  const [timetableDialogOpen, setTimetableDialogOpen] = useState(false)
  const [selectedChild, setSelectedChild] = useState('student-1') // Default child

  // Mock parent's children - in real app, this would come from auth context
  const parentEmail = 'parent@example.com'
  const { data: children = [] } = useStudents({ parentEmail })

  // Use first child as default if no selection
  const currentChild =
    children.find(child => child.id === selectedChild) || children[0]

  // Fetch dashboard data for selected child
  const {
    data: kpis,
    isLoading: kpisLoading,
    error: kpisError,
  } = useDashboardKpis('parent')
  const { data: studentFees } = useStudentFees(currentChild?.id)
  const { data: notices = [] } = useNoticesByAudience('parent')
  const { data: homework = [] } = useStudentHomework(currentChild?.id)

  // Get attendance for current month
  const currentMonth = new Date()
  const startOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  )
  const { data: attendanceRecords = [] } = useStudentAttendance(
    currentChild?.id,
    {
      start: startOfMonth.toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    }
  )

  // Get exam results
  const { data: examResults = [] } = useExamResults(null, currentChild?.id)

  // Calculate attendance percentage
  const attendancePercentage = React.useMemo(() => {
    if (attendanceRecords.length === 0) return 0
    const presentDays = attendanceRecords.filter(
      record => record.status === 'present'
    ).length
    return ((presentDays / attendanceRecords.length) * 100).toFixed(1)
  }, [attendanceRecords])

  // Find next exam date
  const nextExamDate = React.useMemo(() => {
    const today = new Date()
    const upcomingExams = examResults.filter(
      exam => new Date(exam.date) > today
    )
    if (upcomingExams.length === 0) return 'No upcoming exams'

    const nextExam = upcomingExams.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    )[0]
    return new Date(nextExam.date).toLocaleDateString()
  }, [examResults])

  // Mock timetable data
  const weeklyTimetable = {
    Monday: [
      { time: '09:00-09:45', subject: 'Mathematics', teacher: 'Mr. Smith' },
      { time: '09:45-10:30', subject: 'English', teacher: 'Ms. Davis' },
      { time: '11:00-11:45', subject: 'Physics', teacher: 'Dr. Brown' },
      { time: '11:45-12:30', subject: 'Chemistry', teacher: 'Dr. Wilson' },
      { time: '14:00-14:45', subject: 'History', teacher: 'Mr. Johnson' },
    ],
    Tuesday: [
      { time: '09:00-09:45', subject: 'English', teacher: 'Ms. Davis' },
      { time: '09:45-10:30', subject: 'Mathematics', teacher: 'Mr. Smith' },
      { time: '11:00-11:45', subject: 'Biology', teacher: 'Dr. Lee' },
      { time: '11:45-12:30', subject: 'Geography', teacher: 'Ms. Taylor' },
      {
        time: '14:00-14:45',
        subject: 'Computer Science',
        teacher: 'Mr. Anderson',
      },
    ],
    // Add more days as needed
  }

  // KPI Cards data
  const kpiCards = [
    {
      title: "Child's Attendance",
      value: `${attendancePercentage}%`,
      change: `${attendanceRecords.filter(r => r.status === 'present').length}/${attendanceRecords.length} days`,
      changeType:
        parseFloat(attendancePercentage) >= 75 ? 'positive' : 'negative',
      icon: Users,
      description: 'this month',
    },
    {
      title: 'Fee Due',
      value: `₹${studentFees?.totalPending?.toLocaleString() || 0}`,
      change: studentFees?.totalPaid
        ? `₹${studentFees.totalPaid.toLocaleString()} paid`
        : 'No payments',
      changeType: studentFees?.totalPending > 0 ? 'negative' : 'positive',
      icon: DollarSign,
      description: 'outstanding',
    },
    {
      title: 'Next Exam Date',
      value: nextExamDate === 'No upcoming exams' ? 'None' : nextExamDate,
      change: 'Mathematics',
      changeType: 'neutral',
      icon: Calendar,
      description: 'upcoming',
    },
    {
      title: 'Overall Grade',
      value: 'A-',
      change: '+0.2 GPA',
      changeType: 'positive',
      icon: TrendingUp,
      description: 'this term',
    },
  ]

  // Quick Actions
  const quickActions = [
    {
      id: 'download-report',
      label: 'Download Report Card',
      icon: Download,
      variant: 'default',
      description: 'Get latest report card',
      onClick: () => setReportCardDialogOpen(true),
    },
    {
      id: 'view-timetable',
      label: 'View Timetable',
      icon: Clock,
      variant: 'outline',
      description: 'Check class schedule',
      onClick: () => setTimetableDialogOpen(true),
    },
    {
      id: 'contact-teacher',
      label: 'Contact Teacher',
      icon: Bell,
      variant: 'outline',
      description: 'Send message to teacher',
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
      key: 'assignedDate',
      header: 'Assigned',
      render: value => new Date(value).toLocaleDateString(),
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
  ]

  // Table columns for fee history
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
      header: 'Payment Date',
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
    {
      key: 'actions',
      header: 'Receipt',
      render: (_, row) =>
        row.status === 'paid' && (
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4" />
          </Button>
        ),
    },
  ]

  // Generate attendance chart data
  const attendanceChartData = React.useMemo(() => {
    const last30Days = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const record = attendanceRecords.find(r => r.date === dateStr)

      // Only include weekdays
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        last30Days.push({
          name: date.getDate().toString(),
          value: record?.status === 'present' ? 1 : 0,
        })
      }
    }
    return last30Days.slice(-20) // Last 20 school days
  }, [attendanceRecords])

  // Handle loading states
  if (kpisLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Parent Dashboard
            </h1>
            <p className="text-gray-600">
              Monitor your child's academic progress
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
          <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
          <p className="text-gray-600">
            Monitor your child's academic progress
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {children.length > 1 && (
            <select
              value={selectedChild}
              onChange={e => setSelectedChild(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.isArray(children) &&
                children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.name} - {child.classId}
                  </option>
                ))}
            </select>
          )}
          <Badge variant="info" className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>{currentChild?.name || 'No Child Selected'}</span>
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

      {/* Parent Tools */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Parent Tools</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Homework Monitoring */}
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
                  <h3 className="font-semibold text-gray-900">
                    Homework Monitoring
                  </h3>
                  <p className="text-sm text-gray-600">
                    Track Child's Assignments
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
                  <div className="text-gray-500">Completed</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-xs text-gray-500">
                  Monitor homework progress
                </div>
              </div>
            </CardContent>
          </Card>

          {/* School Communication */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    School Communication
                  </h3>
                  <p className="text-sm text-gray-600">Messages & Notices</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-blue-600">
                    {notices.length}
                  </div>
                  <div className="text-gray-500">New Notices</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-600">3</div>
                  <div className="text-gray-500">Messages</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-xs text-gray-500">
                  Stay connected with school
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Progress */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Academic Progress
                  </h3>
                  <p className="text-sm text-gray-600">Grades & Performance</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-green-600">A-</div>
                  <div className="text-gray-500">Overall Grade</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-600">
                    {attendancePercentage}%
                  </div>
                  <div className="text-gray-500">Attendance</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-xs text-gray-500">
                  Track academic performance
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Results & Report Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Results & Report Cards</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {examResults.length === 0 ? (
              <EmptyState
                title="No Results Available"
                description="No exam results or report cards available yet."
                variant="default"
              />
            ) : (
              <div className="space-y-4">
                {examResults.slice(0, 4).map(result => (
                  <div key={result.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Mathematics Mid-term</h4>
                        <p className="text-sm text-gray-600">
                          Total Marks: 100
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(result.evaluatedAt).toLocaleDateString()}
                        </p>
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
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                        {result.remarks}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Homework */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ClipboardList className="h-5 w-5" />
                <span>Homework</span>
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
                description="No homework assignments found."
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

        {/* Fee Dues & Receipts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Fee Dues & Receipts</span>
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
                description="No recent notices for parents."
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

      {/* Attendance Chart */}
      <TrendChart
        title="Monthly Attendance Trend"
        description="Your child's attendance over the past month"
        data={attendanceChartData}
        type="line"
        color="#10b981"
        formatTooltip={value => [value === 1 ? 'Present' : 'Absent', 'Status']}
      />

      {/* Report Card Dialog */}
      <Dialog
        open={reportCardDialogOpen}
        onOpenChange={setReportCardDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Card - {currentChild?.name}</DialogTitle>
            <DialogClose onClose={() => setReportCardDialogOpen(false)} />
          </DialogHeader>
          <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold">Academic Report Card</h3>
                <p className="text-gray-600">Term 1, Academic Year 2023-24</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p>
                    <strong>Student:</strong> {currentChild?.name}
                  </p>
                  <p>
                    <strong>Class:</strong> {currentChild?.classId} -{' '}
                    {currentChild?.section}
                  </p>
                  <p>
                    <strong>Roll No:</strong> {currentChild?.rollNumber}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Attendance:</strong> {attendancePercentage}%
                  </p>
                  <p>
                    <strong>Overall Grade:</strong> A-
                  </p>
                  <p>
                    <strong>Rank:</strong> 5th
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Subject-wise Performance:</h4>
                {[
                  'Mathematics',
                  'English',
                  'Physics',
                  'Chemistry',
                  'Biology',
                ].map(subject => (
                  <div
                    key={subject}
                    className="flex justify-between items-center p-2 bg-white rounded"
                  >
                    <span>{subject}</span>
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">85/100</span>
                      <Badge variant="success">A</Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  <strong>Teacher's Remarks:</strong> Excellent performance in
                  all subjects. Shows great potential and consistent
                  improvement.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Timetable Dialog */}
      <Dialog open={timetableDialogOpen} onOpenChange={setTimetableDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Weekly Timetable - {currentChild?.name}</DialogTitle>
            <DialogClose onClose={() => setTimetableDialogOpen(false)} />
          </DialogHeader>
          <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.isArray(Object.entries(weeklyTimetable)) &&
                Object.entries(weeklyTimetable).map(([day, schedule]) => (
                  <Card key={day}>
                    <CardHeader>
                      <CardTitle className="text-lg">{day}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Array.isArray(schedule) &&
                          schedule.map((period, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-2 bg-gray-50 rounded"
                            >
                              <div>
                                <div className="font-medium">
                                  {period.subject}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {period.teacher}
                                </div>
                              </div>
                              <div className="text-sm font-medium text-blue-600">
                                {period.time}
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default withRoleGuard([USER_ROLES.PARENT])(ParentDashboard)
