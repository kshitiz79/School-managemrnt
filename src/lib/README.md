# React Query API Setup

This document explains the React Query implementation for the school management system, including mock API functions, query hooks, and usage examples.

## 📁 File Structure

```
src/lib/
├── queryClient.js     # React Query client configuration
├── mockData.js        # Realistic demo data for all entities
├── api.js            # Mock API functions with simulated latency
└── README.md         # This documentation

src/hooks/
└── useApi.js         # React Query hooks for all entities
```

## 🔧 Query Client Configuration

The query client is configured with:
- **Stale Time**: 5 minutes (data considered fresh)
- **Cache Time**: 10 minutes (data kept in cache)
- **Retry Logic**: Smart retry (no retry on 4xx errors)
- **Auto Refetch**: Disabled on window focus

## 📊 Mock Data Entities

### Core Entities
- **Classes**: 10 classes (Class 1-10) with sections A, B, C
- **Subjects**: 13 subjects (Math, English, Science, etc.)
- **Students**: 50+ realistic student records
- **Staff**: 5 staff members (Principal, Teachers, Accountant)

### Academic Data
- **Attendance**: 30 days of attendance records (90% rate)
- **Exams**: Scheduled and completed exams with results
- **Homework**: Assignments with submission tracking
- **Grades**: Performance data and grade distributions

### Administrative Data
- **Fees**: Fee structure, payments, and collection tracking
- **Notices**: School announcements and communications
- **Admissions**: Application processing workflow
- **Leave Requests**: Staff and student leave management

## 🚀 API Functions

All API functions simulate realistic behavior:

### Features
- **Realistic Latency**: 500-1500ms response times
- **Error Simulation**: 5% random error rate
- **CRUD Operations**: Full Create, Read, Update, Delete support
- **Filtering**: Search and filter capabilities
- **Relationships**: Proper data relationships between entities

### Example API Usage

```javascript
import api from '../lib/api'

// Get all students
const students = await api.students.getAll()

// Get students by class
const classStudents = await api.students.getByClass('class-10', 'A')

// Create new student
const newStudent = await api.students.create({
  name: 'John Doe',
  email: 'john@student.edu',
  classId: 'class-10',
  section: 'A'
})

// Mark attendance
await api.attendance.markAttendance([
  {
    userId: 'student-1',
    type: 'student',
    date: '2024-01-15',
    status: 'present'
  }
])
```

## 🎣 React Query Hooks

### Students Hooks
```javascript
import { useStudents, useStudent, useCreateStudent } from '../hooks/useApi'

// Get all students with optional filters
const { data: students, isLoading, error } = useStudents({ 
  name: 'John',
  status: 'active' 
})

// Get single student
const { data: student } = useStudent('student-1')

// Create student mutation
const createStudent = useCreateStudent()
await createStudent.mutateAsync(studentData)
```

### Attendance Hooks
```javascript
import { 
  useTodayAttendance, 
  useStudentAttendance, 
  useMarkAttendance 
} from '../hooks/useApi'

// Get today's attendance summary
const { data: todayAttendance } = useTodayAttendance()

// Get student attendance for date range
const { data: attendance } = useStudentAttendance('student-1', {
  start: '2024-01-01',
  end: '2024-01-31'
})

// Mark attendance
const markAttendance = useMarkAttendance()
```

### Dashboard Hooks
```javascript
import { useDashboardKpis } from '../hooks/useApi'

// Get role-specific KPIs
const { data: kpis } = useDashboardKpis('teacher')
// Returns: { totalStudents, totalClasses, pendingHomework, upcomingExams }
```

## 📈 Usage Examples

### 1. Loading States
```javascript
const { data, isLoading, error } = useStudents()

if (isLoading) return <LoadingSkeleton.Table />
if (error) return <ErrorState error={error} />
return <DataTable data={data} />
```

### 2. Mutations with Optimistic Updates
```javascript
const createStudent = useCreateStudent()

const handleSubmit = async (formData) => {
  try {
    await createStudent.mutateAsync(formData)
    toast.success('Student created successfully!')
  } catch (error) {
    toast.error('Failed to create student')
  }
}
```

### 3. Dependent Queries
```javascript
const { data: selectedClass } = useClass(classId)
const { data: students } = useStudentsByClass(
  selectedClass?.id, 
  selectedClass?.section,
  { enabled: !!selectedClass }
)
```

### 4. Real-time Data
```javascript
const { data: todayAttendance } = useTodayAttendance()
// Automatically refetches every 5 minutes
```

## 🎯 Query Keys

Organized query keys for efficient cache management:

```javascript
import { queryKeys } from '../lib/queryClient'

// Students
queryKeys.students              // ['students']
queryKeys.student('student-1')  // ['students', 'student-1']
queryKeys.studentsByClass('class-10', 'A') // ['students', 'class', 'class-10', 'A']

// Attendance
queryKeys.todayAttendance       // ['attendance', 'today']
queryKeys.studentAttendance('student-1', dateRange) // ['attendance', 'student', 'student-1', dateRange]
```

## 🔄 Cache Invalidation

Mutations automatically invalidate related queries:

```javascript
const createStudent = useCreateStudent()
// On success, invalidates:
// - queryKeys.students (all student lists)
// - Related class student lists
```

## 🛠️ Development Tools

React Query DevTools are included for development:
- Query inspection
- Cache visualization
- Network request monitoring
- Performance analysis

Access via the floating DevTools button in development mode.

## 📱 Error Handling

Comprehensive error handling:

```javascript
const { data, error, isError } = useStudents()

if (isError) {
  // error.status - HTTP status code
  // error.message - Error message
  return <ErrorState error={error} onRetry={refetch} />
}
```

## 🎨 Integration with UI Components

Seamless integration with UI components:

```javascript
// Automatic loading states
<DataTable 
  data={students} 
  loading={isLoading}
  error={error}
  columns={columns}
/>

// KPI cards with real data
<KpiCard
  title="Total Students"
  value={kpis?.totalStudents}
  loading={kpisLoading}
/>
```

## 🚀 Performance Features

- **Background Refetching**: Keeps data fresh
- **Optimistic Updates**: Immediate UI feedback
- **Request Deduplication**: Prevents duplicate requests
- **Intelligent Caching**: Reduces API calls
- **Stale While Revalidate**: Shows cached data while fetching fresh data

## 📊 Mock Data Statistics

- **Students**: 50+ with realistic profiles
- **Staff**: 5 members across different roles
- **Attendance**: 30 days of records (90% attendance rate)
- **Exams**: Multiple exam types and results
- **Fees**: Complete payment history and tracking
- **Homework**: Active assignments with submissions

This setup provides a production-ready foundation for the school management system with realistic data and comprehensive API coverage.