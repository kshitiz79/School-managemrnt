import React, { useState } from 'react'
import { Users, BookOpen, Calendar, BarChart3 } from 'lucide-react'
import { withRoleGuard } from '../../guards/withRoleGuard.jsx'
import { USER_ROLES } from '../../constants/auth'
import {
  useStudentsByClass,
  useHomeworkByClass,
  useExamSchedule,
  useClassAttendance,
  useDashboardKpis,
  useCreateHomework,
  useMarkAttendance,
} from '../../hooks/useApi'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  KpiCard,
  TrendChart,
  ClassSectionPicker,
  DateRangePicker,
  QuickActions,
  EmptyState,
  LoadingSkeleton,
  ErrorState,
  FormDialog,
  Input,
  Button,
} from '../../components/ui'

const Classes = () => {
  const [selectedClass, setSelectedClass] = useState(null)
  const [dateRange, setDateRange] = useState({ start: null, end: null })
  const [homeworkDialogOpen, setHomeworkDialogOpen] = useState(false)

  // Fetch teacher dashboard KPIs
  const {
    data: kpis,
    isLoading: kpisLoading,
    error: kpisError,
  } = useDashboardKpis('teacher')

  // Fetch students for selected class
  const {
    data: students = [],
    isLoading: studentsLoading,
    error: studentsError,
  } = useStudentsByClass(selectedClass?.classId, selectedClass?.sectionName, {
    enabled: !!selectedClass,
  })

  // Fetch homework for selected class
  const { data: homework = [], isLoading: homeworkLoading } =
    useHomeworkByClass(selectedClass?.classId, selectedClass?.sectionName, {
      enabled: !!selectedClass,
    })

  // Fetch exam schedule for selected class
  const { data: exams = [], isLoading: examsLoading } = useExamSchedule(
    selectedClass?.classId,
    selectedClass?.sectionName,
    { enabled: !!selectedClass }
  )

  // Fetch attendance for selected class (today)
  const today = new Date().toISOString().split('T')[0]
  const { data: attendanceData = [], isLoading: attendanceLoading } =
    useClassAttendance(
      selectedClass?.classId,
      selectedClass?.sectionName,
      today,
      { enabled: !!selectedClass }
    )

  // Mutations
  const createHomeworkMutation = useCreateHomework()
  const markAttendanceMutation = useMarkAttendance()

  // Transform KPIs data
  const kpiData = React.useMemo(() => {
    if (!kpis) return []

    return [
      {
        title: 'Total Students',
        value: kpis.totalStudents?.toString() || '0',
        change: '+12%',
        changeType: 'positive',
        icon: Users,
        description: 'from last month',
      },
      {
        title: 'Active Classes',
        value: kpis.totalClasses?.toString() || '0',
        change: '+2',
        changeType: 'positive',
        icon: BookOpen,
        description: 'new this semester',
      },
      {
        title: 'Pending Homework',
        value: kpis.pendingHomework?.toString() || '0',
        change:
          homework.length > 0 ? `${homework.length} total` : 'No assignments',
        changeType: 'neutral',
        icon: Calendar,
        description: 'assignments',
      },
      {
        title: 'Upcoming Exams',
        value: kpis.upcomingExams?.toString() || '0',
        change:
          exams.length > 0 ? `${exams.length} scheduled` : 'None scheduled',
        changeType: 'neutral',
        icon: BarChart3,
        description: 'this month',
      },
    ]
  }, [kpis, homework.length, exams.length])

  // Generate attendance chart data
  const weeklyAttendanceData = React.useMemo(() => {
    // Mock weekly data - in real app, this would come from API
    return [
      { name: 'Mon', value: 95 },
      { name: 'Tue', value: 88 },
      { name: 'Wed', value: 92 },
      { name: 'Thu', value: 85 },
      { name: 'Fri', value: 90 },
    ]
  }, [])

  // Generate grade distribution data
  const gradeDistribution = React.useMemo(() => {
    // Mock data - in real app, calculate from actual grades
    return [
      { name: 'A', value: 25 },
      { name: 'B', value: 35 },
      { name: 'C', value: 20 },
      { name: 'D', value: 15 },
      { name: 'F', value: 5 },
    ]
  }, [])

  const quickActions = [
    {
      id: 'create-assignment',
      label: 'Create Assignment',
      icon: BookOpen,
      variant: 'default',
      description: 'Add new assignment',
      onClick: () => setHomeworkDialogOpen(true),
    },
    {
      id: 'take-attendance',
      label: 'Take Attendance',
      icon: Users,
      variant: 'outline',
      description: 'Mark student attendance',
      onClick: () => handleTakeAttendance(),
    },
    {
      id: 'grade-submissions',
      label: 'Grade Submissions',
      icon: BarChart3,
      variant: 'outline',
      description: 'Review and grade work',
      badge: homework.filter(hw => hw.status === 'submitted').length.toString(),
    },
    {
      id: 'schedule-class',
      label: 'Schedule Class',
      icon: Calendar,
      variant: 'outline',
      description: 'Plan class sessions',
    },
  ]

  const handleClassChange = classData => {
    setSelectedClass(classData)
  }

  const handleCreateHomework = async event => {
    event.preventDefault()
    const formData = new FormData(event.target)

    try {
      await createHomeworkMutation.mutateAsync({
        title: formData.get('title'),
        description: formData.get('description'),
        subjectId: 'math', // Default subject
        classId: selectedClass.classId,
        section: selectedClass.sectionName,
        assignedBy: 'staff-2', // Current teacher
        assignedDate: new Date().toISOString().split('T')[0],
        dueDate: formData.get('dueDate'),
        status: 'active',
        instructions: formData.get('instructions') || '',
      })
      setHomeworkDialogOpen(false)
    } catch (error) {
      console.error('Failed to create homework:', error)
    }
  }

  const handleTakeAttendance = async () => {
    if (!selectedClass || !students.length) return

    // Mock attendance marking - in real app, this would be a proper form
    const attendanceRecords = Array.isArray(students)
      ? students.map(student => ({
          userId: student.id,
          type: 'student',
          date: today,
          status: Math.random() > 0.1 ? 'present' : 'absent', // 90% attendance rate
          markedBy: 'staff-2', // Current teacher
        }))
      : []

    try {
      await markAttendanceMutation.mutateAsync(attendanceRecords)
      alert('Attendance marked successfully!')
    } catch (error) {
      console.error('Failed to mark attendance:', error)
    }
  }

  // Handle loading states
  const isLoading =
    kpisLoading || studentsLoading || homeworkLoading || examsLoading
  const error = kpisError || studentsError

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton.Dashboard />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          error={error}
          onRetry={() => window.location.reload()}
          showRetry={true}
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
          <p className="text-gray-600">
            Manage your classes and track student progress
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <ClassSectionPicker
            value={selectedClass?.fullId}
            onChange={handleClassChange}
            label="Select Class"
            placeholder="Choose a class to view details..."
          />
        </div>
        <div className="flex-1">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            label="Date Range"
            placeholder="Select date range for analytics..."
          />
        </div>
      </div>

      {selectedClass ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.isArray(kpiData) &&
              kpiData.map((kpi, index) => <KpiCard key={index} {...kpi} />)}
          </div>

          {/* Quick Actions */}
          <QuickActions
            title={`Quick Actions for ${selectedClass.className} - ${selectedClass.sectionName}`}
            actions={quickActions}
            variant="card"
            layout="grid"
          />

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendChart
              title="Weekly Attendance"
              description="Student attendance over the past week"
              data={weeklyAttendanceData}
              type="bar"
              color="#3b82f6"
              formatTooltip={value => [`${value}%`, 'Attendance']}
            />

            <TrendChart
              title="Grade Distribution"
              description="Current grade distribution for the class"
              data={gradeDistribution}
              type="pie"
              colors={['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280']}
            />
          </div>

          {/* Class Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Class:</span>
                    <span className="font-medium">
                      {selectedClass.className}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Section:</span>
                    <span className="font-medium">
                      {selectedClass.sectionName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Students:</span>
                    <span className="font-medium">
                      {selectedClass.students}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subject:</span>
                    <span className="font-medium">Mathematics</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Schedule:</span>
                    <span className="font-medium">Mon, Wed, Fri - 9:00 AM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Assignment submitted
                      </p>
                      <p className="text-xs text-gray-500">
                        John Smith - 2 hours ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        New announcement posted
                      </p>
                      <p className="text-xs text-gray-500">
                        Quiz scheduled for Friday - 4 hours ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Attendance marked</p>
                      <p className="text-xs text-gray-500">
                        28/30 students present - 1 day ago
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <EmptyState
          title="No Class Selected"
          description="Please select a class from the dropdown above to view class details and analytics."
          variant="courses"
        />
      )}

      {/* Homework Creation Dialog */}
      <FormDialog
        open={homeworkDialogOpen}
        onOpenChange={setHomeworkDialogOpen}
        title="Create New Assignment"
        description="Add a new homework assignment for your class"
        onSubmit={handleCreateHomework}
        submitLabel="Create Assignment"
        loading={createHomeworkMutation.isPending}
      >
        <div className="space-y-4">
          <Input
            name="title"
            label="Assignment Title"
            placeholder="Enter assignment title"
            required
          />
          <Input
            name="description"
            label="Description"
            placeholder="Enter assignment description"
            required
          />
          <Input name="dueDate" type="date" label="Due Date" required />
          <Input
            name="instructions"
            label="Instructions"
            placeholder="Additional instructions for students"
          />
        </div>
      </FormDialog>
    </div>
  )
}

export default withRoleGuard([USER_ROLES.TEACHER])(Classes)
