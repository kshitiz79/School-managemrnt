import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Users,
  ClipboardList,
  Calendar,
  Clock,
  CheckCircle,
  Upload,
  BarChart3,
  MessageSquare,
  Bell,
  AlertCircle,
  FileText,
  Send,
  Notebook,
  GraduationCap,
  Target,
  Copy,
  Mail,
} from 'lucide-react'
import { withRoleGuard } from '../../guards/withRoleGuard.jsx'
import { USER_ROLES } from '../../constants/auth'
import {
  useDashboardKpis,
  useStudentsByClass,
  useHomeworkByClass,
  useExamSchedule,
  useClassAttendance,
  useNoticesByAudience,
  useMarkAttendance,
  useCreateHomework,
  useSubmitExamResult,
} from '../../hooks/useApi'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  KpiCard,
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

const TeacherDashboard = () => {
  const navigate = useNavigate()

  // State for dialogs and forms
  const [markAttendanceDialogOpen, setMarkAttendanceDialogOpen] =
    useState(false)
  const [uploadHomeworkDialogOpen, setUploadHomeworkDialogOpen] =
    useState(false)
  const [enterMarksDialogOpen, setEnterMarksDialogOpen] = useState(false)
  const [messageParentsDialogOpen, setMessageParentsDialogOpen] =
    useState(false)
  const [selectedClass, setSelectedClass] = useState('class-10') // Default class
  const [selectedSection, setSelectedSection] = useState('A')

  // Fetch dashboard data
  const {
    data: kpis,
    isLoading: kpisLoading,
    error: kpisError,
  } = useDashboardKpis('teacher')
  const { data: students = [] } = useStudentsByClass(
    selectedClass,
    selectedSection
  )
  const { data: homework = [] } = useHomeworkByClass(
    selectedClass,
    selectedSection
  )
  const { data: exams = [] } = useExamSchedule(selectedClass, selectedSection)
  const { data: notices = [] } = useNoticesByAudience('staff')

  // Get today's date for attendance
  const today = new Date().toISOString().split('T')[0]
  const { data: attendanceData = [] } = useClassAttendance(
    selectedClass,
    selectedSection,
    today
  )

  // Mutations
  const markAttendanceMutation = useMarkAttendance()
  const createHomeworkMutation = useCreateHomework()
  const submitExamResultMutation = useSubmitExamResult()

  // Mock timetable data - in real app, this would come from API
  const todayTimetable = [
    {
      time: '09:00 - 09:45',
      subject: 'Mathematics',
      class: 'Class 10A',
      room: 'Room 201',
    },
    {
      time: '09:45 - 10:30',
      subject: 'Physics',
      class: 'Class 10B',
      room: 'Lab 3',
    },
    {
      time: '11:00 - 11:45',
      subject: 'Mathematics',
      class: 'Class 9A',
      room: 'Room 201',
    },
    {
      time: '11:45 - 12:30',
      subject: 'Physics',
      class: 'Class 9B',
      room: 'Lab 3',
    },
    {
      time: '14:00 - 14:45',
      subject: 'Mathematics',
      class: 'Class 10C',
      room: 'Room 201',
    },
  ]

  // KPI Cards data
  const kpiCards = [
    {
      title: 'Assigned Classes',
      value: kpis?.totalClasses?.toString() || '0',
      change: '6 subjects',
      changeType: 'neutral',
      icon: BookOpen,
      description: 'active classes',
    },
    {
      title: 'Attendance Due Today',
      value: attendanceData
        .filter(a => a.attendance.status === 'not_marked')
        .length.toString(),
      change: `${attendanceData.length} total students`,
      changeType:
        attendanceData.filter(a => a.attendance.status === 'not_marked')
          .length > 0
          ? 'negative'
          : 'positive',
      icon: Users,
      description: 'need marking',
    },
    {
      title: 'Pending Submissions',
      value: homework.filter(hw => hw.status === 'submitted').length.toString(),
      change: `${homework.length} total assignments`,
      changeType: 'neutral',
      icon: ClipboardList,
      description: 'to review',
    },
    {
      title: 'Upcoming Exams',
      value: kpis?.upcomingExams?.toString() || '0',
      change: 'next 7 days',
      changeType: 'neutral',
      icon: Calendar,
      description: 'scheduled',
    },
  ]

  // Quick Actions
  const quickActions = [
    {
      id: 'mark-attendance',
      label: 'Mark Attendance',
      icon: CheckCircle,
      variant: 'default',
      description: 'Take class attendance',
      onClick: () => setMarkAttendanceDialogOpen(true),
      badge: attendanceData
        .filter(a => a.attendance.status === 'not_marked')
        .length.toString(),
    },
    {
      id: 'upload-homework',
      label: 'Upload Homework',
      icon: Upload,
      variant: 'outline',
      description: 'Assign new homework',
      onClick: () => setUploadHomeworkDialogOpen(true),
    },
    {
      id: 'enter-marks',
      label: 'Enter Exam Marks',
      icon: BarChart3,
      variant: 'outline',
      description: 'Record exam results',
      onClick: () => setEnterMarksDialogOpen(true),
    },
    {
      id: 'message-parents',
      label: 'Message Parents',
      icon: MessageSquare,
      variant: 'outline',
      description: 'Send notifications',
      onClick: () => setMessageParentsDialogOpen(true),
    },
  ]

  // Table columns for attendance
  const attendanceColumns = [
    {
      key: 'student',
      header: 'Student',
      render: (_, row) => (
        <div>
          <div className="font-medium">{row.student.name}</div>
          <div className="text-sm text-gray-500">{row.student.rollNumber}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_, row) => (
        <Badge
          variant={
            row.attendance.status === 'present'
              ? 'success'
              : row.attendance.status === 'absent'
                ? 'danger'
                : 'secondary'
          }
        >
          {row.attendance.status === 'not_marked'
            ? 'Not Marked'
            : row.attendance.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Quick Mark',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickAttendance(row.student.id, 'present')}
            disabled={row.attendance.status !== 'not_marked'}
          >
            Present
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickAttendance(row.student.id, 'absent')}
            disabled={row.attendance.status !== 'not_marked'}
          >
            Absent
          </Button>
        </div>
      ),
    },
  ]

  // Event handlers
  const handleQuickAttendance = async (studentId, status) => {
    try {
      await markAttendanceMutation.mutateAsync([
        {
          userId: studentId,
          type: 'student',
          date: today,
          status,
          markedBy: 'current-teacher',
        },
      ])
    } catch (error) {
      console.error('Failed to mark attendance:', error)
    }
  }

  const handleMarkAttendance = async event => {
    event.preventDefault()
    const formData = new FormData(event.target)

    const attendanceRecords = attendanceData.map(({ student }) => ({
      userId: student.id,
      type: 'student',
      date: today,
      status: formData.get(`attendance-${student.id}`) || 'absent',
      markedBy: 'current-teacher',
    }))

    try {
      await markAttendanceMutation.mutateAsync(attendanceRecords)
      setMarkAttendanceDialogOpen(false)
    } catch (error) {
      console.error('Failed to mark attendance:', error)
    }
  }

  const handleUploadHomework = async event => {
    event.preventDefault()
    const formData = new FormData(event.target)

    try {
      await createHomeworkMutation.mutateAsync({
        title: formData.get('title'),
        description: formData.get('description'),
        subjectId: formData.get('subject'),
        classId: selectedClass,
        section: selectedSection,
        assignedBy: 'current-teacher',
        assignedDate: today,
        dueDate: formData.get('dueDate'),
        status: 'active',
        instructions: formData.get('instructions'),
      })
      setUploadHomeworkDialogOpen(false)
    } catch (error) {
      console.error('Failed to create homework:', error)
    }
  }

  const handleEnterMarks = async event => {
    event.preventDefault()
    const formData = new FormData(event.target)

    try {
      await submitExamResultMutation.mutateAsync({
        examId: formData.get('examId'),
        studentId: formData.get('studentId'),
        marksObtained: parseInt(formData.get('marks')),
        grade: formData.get('grade'),
        remarks: formData.get('remarks'),
        evaluatedBy: 'current-teacher',
      })
      setEnterMarksDialogOpen(false)
    } catch (error) {
      console.error('Failed to submit marks:', error)
    }
  }

  // Handle loading states
  if (kpisLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Teacher Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your classes and student progress
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
            Teacher Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your classes and student progress
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="w-32"
          >
            <option value="class-9">Class 9</option>
            <option value="class-10">Class 10</option>
          </Select>
          <Select
            value={selectedSection}
            onChange={e => setSelectedSection(e.target.value)}
            className="w-24"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </Select>
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

      {/* Teaching Modules */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Teaching Tools</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Homework Management */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/dashboard/homework/daily')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Notebook className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Homework Management
                  </h3>
                  <p className="text-sm text-gray-600">
                    Assign & Track Homework
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-orange-600">12</div>
                  <div className="text-gray-500">Active</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-600">85%</div>
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

          {/* Lesson Planning */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/dashboard/lessonplan/lessons')}
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
                    Create & Manage Lessons
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-purple-600">28</div>
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
                    navigate('/dashboard/lessonplan/lessons')
                  }}
                  className="flex-1 bg-purple-50 text-purple-700 px-3 py-1 rounded text-xs hover:bg-purple-100"
                >
                  My Lessons
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    navigate('/dashboard/lessonplan/topics')
                  }}
                  className="flex-1 bg-green-50 text-green-700 px-3 py-1 rounded text-xs hover:bg-green-100"
                >
                  Topics
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Communication */}
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
                  <h3 className="font-semibold text-gray-900">Communication</h3>
                  <p className="text-sm text-gray-600">
                    Message Parents & Students
                  </p>
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
                    navigate('/dashboard/communication/send-message')
                  }}
                  className="flex-1 bg-blue-50 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-100"
                >
                  Send Message
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    navigate('/dashboard/communication/notice-board')
                  }}
                  className="flex-1 bg-gray-50 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-100"
                >
                  Notices
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Tools */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <button
            onClick={() => navigate('/dashboard/lessonplan/copy-old')}
            className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <Copy className="h-6 w-6 text-gray-600 mx-auto mb-2" />
            <div className="text-sm font-medium">Copy Old Lessons</div>
          </button>

          <button
            onClick={() => navigate('/dashboard/communication/template-email')}
            className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <Mail className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-sm font-medium">Email Templates</div>
          </button>

          <button
            onClick={() => navigate('/dashboard/lessonplan/topics')}
            className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <Target className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <div className="text-sm font-medium">Manage Topics</div>
          </button>

          <button
            onClick={() => navigate('/dashboard/communication/log')}
            className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <FileText className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-sm font-medium">Message Logs</div>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Timetable */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Today's Timetable</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.isArray(todayTimetable) &&
                todayTimetable.map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {slot.subject}
                      </div>
                      <div className="text-sm text-gray-600">
                        {slot.class} - {slot.room}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-blue-600">
                      {slot.time}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Student Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Student Attendance</span>
              </div>
              <Badge variant="outline">
                {
                  attendanceData.filter(
                    a => a.attendance.status === 'not_marked'
                  ).length
                }{' '}
                pending
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceData.length === 0 ? (
              <EmptyState
                title="No Students"
                description="No students found for the selected class and section."
                variant="users"
              />
            ) : (
              <DataTable
                data={attendanceData.slice(0, 5)}
                columns={attendanceColumns}
                sortable={false}
                paginated={false}
                emptyMessage="No attendance data found"
              />
            )}
          </CardContent>
        </Card>

        {/* Upcoming Exams & Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Upcoming Exams & Assignments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Exams */}
              {exams.slice(0, 3).map(exam => (
                <div key={exam.id} className="border-l-4 border-red-500 pl-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{exam.name}</h4>
                      <p className="text-sm text-gray-600">
                        {exam.subjectId} - {exam.totalMarks} marks
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(exam.date).toLocaleDateString()} at{' '}
                        {exam.startTime}
                      </p>
                    </div>
                    <Badge variant="danger" size="sm">
                      Exam
                    </Badge>
                  </div>
                </div>
              ))}

              {/* Homework */}
              {homework.slice(0, 2).map(hw => (
                <div key={hw.id} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{hw.title}</h4>
                      <p className="text-sm text-gray-600">{hw.description}</p>
                      <p className="text-xs text-gray-500">
                        Due: {new Date(hw.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="info" size="sm">
                      Assignment
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
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
                description="No recent notices for teachers."
                variant="default"
              />
            ) : (
              <div className="space-y-4">
                {notices.slice(0, 4).map(notice => (
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
      </div>

      {/* Mark Attendance Dialog */}
      <FormDialog
        open={markAttendanceDialogOpen}
        onOpenChange={setMarkAttendanceDialogOpen}
        title="Mark Class Attendance"
        description={`Mark attendance for ${selectedClass} - Section ${selectedSection}`}
        onSubmit={handleMarkAttendance}
        submitLabel="Submit Attendance"
        loading={markAttendanceMutation.isPending}
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Array.isArray(attendanceData) &&
            attendanceData.map(({ student }) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <div className="font-medium">{student.name}</div>
                  <div className="text-sm text-gray-500">
                    {student.rollNumber}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`attendance-${student.id}`}
                      value="present"
                      className="mr-2"
                      defaultChecked
                    />
                    Present
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`attendance-${student.id}`}
                      value="absent"
                      className="mr-2"
                    />
                    Absent
                  </label>
                </div>
              </div>
            ))}
        </div>
      </FormDialog>

      {/* Upload Homework Dialog */}
      <FormDialog
        open={uploadHomeworkDialogOpen}
        onOpenChange={setUploadHomeworkDialogOpen}
        title="Assign New Homework"
        description="Create a new homework assignment for your class"
        onSubmit={handleUploadHomework}
        submitLabel="Assign Homework"
        loading={createHomeworkMutation.isPending}
      >
        <div className="space-y-4">
          <Input
            name="title"
            label="Assignment Title"
            placeholder="Enter assignment title"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter assignment description"
              required
            />
          </div>
          <Select name="subject" label="Subject" required>
            <option value="">Select Subject</option>
            <option value="math">Mathematics</option>
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
            <option value="english">English</option>
          </Select>
          <Input name="dueDate" type="date" label="Due Date" required />
          <Input
            name="instructions"
            label="Instructions"
            placeholder="Additional instructions"
          />
        </div>
      </FormDialog>

      {/* Enter Marks Dialog */}
      <FormDialog
        open={enterMarksDialogOpen}
        onOpenChange={setEnterMarksDialogOpen}
        title="Enter Exam Marks"
        description="Record exam results for a student"
        onSubmit={handleEnterMarks}
        submitLabel="Submit Marks"
        loading={submitExamResultMutation.isPending}
      >
        <div className="space-y-4">
          <Select name="examId" label="Exam" required>
            <option value="">Select Exam</option>
            {Array.isArray(exams) &&
              exams.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} - {exam.subjectId}
                </option>
              ))}
          </Select>
          <Select name="studentId" label="Student" required>
            <option value="">Select Student</option>
            {Array.isArray(students) &&
              students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} - {student.rollNumber}
                </option>
              ))}
          </Select>
          <Input
            name="marks"
            type="number"
            label="Marks Obtained"
            placeholder="85"
            required
          />
          <Select name="grade" label="Grade" required>
            <option value="">Select Grade</option>
            <option value="A+">A+</option>
            <option value="A">A</option>
            <option value="B+">B+</option>
            <option value="B">B</option>
            <option value="C+">C+</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="F">F</option>
          </Select>
          <Input
            name="remarks"
            label="Remarks"
            placeholder="Optional remarks"
          />
        </div>
      </FormDialog>

      {/* Message Parents Dialog */}
      <FormDialog
        open={messageParentsDialogOpen}
        onOpenChange={setMessageParentsDialogOpen}
        title="Message Parents"
        description="Send a message to parents of your students"
        onSubmit={() => setMessageParentsDialogOpen(false)}
        submitLabel="Send Message"
      >
        <div className="space-y-4">
          <Select name="recipient" label="Send To" required>
            <option value="">Select Recipients</option>
            <option value="all">All Parents</option>
            <option value="class">Class Parents Only</option>
            <option value="individual">Individual Parent</option>
          </Select>
          <Input
            name="subject"
            label="Subject"
            placeholder="Message subject"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              name="message"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your message"
              required
            />
          </div>
        </div>
      </FormDialog>
    </div>
  )
}

export default withRoleGuard([USER_ROLES.TEACHER])(TeacherDashboard)
