import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      onError: error => {
        console.error('Mutation error:', error)
      },
    },
  },
})

// Query keys factory
export const queryKeys = {
  // Students
  students: {
    all: ['students'],
    lists: () => [...queryKeys.students.all, 'list'],
    list: filters => [...queryKeys.students.lists(), { filters }],
    details: () => [...queryKeys.students.all, 'detail'],
    detail: id => [...queryKeys.students.details(), id],
    attendance: id => [...queryKeys.students.detail(id), 'attendance'],
    grades: id => [...queryKeys.students.detail(id), 'grades'],
    fees: id => [...queryKeys.students.detail(id), 'fees'],
  },

  // Staff
  staff: {
    all: ['staff'],
    lists: () => [...queryKeys.staff.all, 'list'],
    list: filters => [...queryKeys.staff.lists(), { filters }],
    details: () => [...queryKeys.staff.all, 'detail'],
    detail: id => [...queryKeys.staff.details(), id],
    attendance: id => [...queryKeys.staff.detail(id), 'attendance'],
  },

  // Classes
  classes: {
    all: ['classes'],
    lists: () => [...queryKeys.classes.all, 'list'],
    list: filters => [...queryKeys.classes.lists(), { filters }],
    details: () => [...queryKeys.classes.all, 'detail'],
    detail: id => [...queryKeys.classes.details(), id],
    students: id => [...queryKeys.classes.detail(id), 'students'],
    subjects: id => [...queryKeys.classes.detail(id), 'subjects'],
  },

  // Subjects
  subjects: {
    all: ['subjects'],
    lists: () => [...queryKeys.subjects.all, 'list'],
    list: filters => [...queryKeys.subjects.lists(), { filters }],
    details: () => [...queryKeys.subjects.all, 'detail'],
    detail: id => [...queryKeys.subjects.details(), id],
  },

  // Attendance
  attendance: {
    all: ['attendance'],
    lists: () => [...queryKeys.attendance.all, 'list'],
    list: filters => [...queryKeys.attendance.lists(), { filters }],
    summary: filters => [...queryKeys.attendance.all, 'summary', { filters }],
  },

  // Exams
  exams: {
    all: ['exams'],
    lists: () => [...queryKeys.exams.all, 'list'],
    list: filters => [...queryKeys.exams.lists(), { filters }],
    details: () => [...queryKeys.exams.all, 'detail'],
    detail: id => [...queryKeys.exams.details(), id],
    results: id => [...queryKeys.exams.detail(id), 'results'],
  },

  // Fees
  fees: {
    all: ['fees'],
    structure: () => [...queryKeys.fees.all, 'structure'],
    payments: () => [...queryKeys.fees.all, 'payments'],
    dues: () => [...queryKeys.fees.all, 'dues'],
    reports: () => [...queryKeys.fees.all, 'reports'],
  },

  // Notices
  notices: {
    all: ['notices'],
    lists: () => [...queryKeys.notices.all, 'list'],
    list: filters => [...queryKeys.notices.lists(), { filters }],
    details: () => [...queryKeys.notices.all, 'detail'],
    detail: id => [...queryKeys.notices.details(), id],
  },

  // Homework
  homework: {
    all: ['homework'],
    lists: () => [...queryKeys.homework.all, 'list'],
    list: filters => [...queryKeys.homework.lists(), { filters }],
    details: () => [...queryKeys.homework.all, 'detail'],
    detail: id => [...queryKeys.homework.details(), id],
    submissions: id => [...queryKeys.homework.detail(id), 'submissions'],
  },

  // Reports
  reports: {
    all: ['reports'],
    academic: () => [...queryKeys.reports.all, 'academic'],
    financial: () => [...queryKeys.reports.all, 'financial'],
    attendance: () => [...queryKeys.reports.all, 'attendance'],
    custom: type => [...queryKeys.reports.all, 'custom', type],
  },

  // Settings
  settings: {
    all: ['settings'],
    system: () => [...queryKeys.settings.all, 'system'],
    user: () => [...queryKeys.settings.all, 'user'],
    school: () => [...queryKeys.settings.all, 'school'],
  },

  // Dashboard KPIs
  kpis: role => ['dashboard', 'kpis', role],

  // Individual query keys used in useApi.js
  student: id => ['students', id],
  studentsByClass: (classId, section) => [
    'students',
    'class',
    classId,
    section,
  ],
  staffMember: id => ['staff', id],
  teachers: ['staff', 'teachers'],
  class: id => ['classes', id],
  sections: classId => ['classes', classId, 'sections'],
  studentAttendance: (studentId, dateRange) => [
    'attendance',
    'student',
    studentId,
    dateRange,
  ],
  staffAttendance: (staffId, dateRange) => [
    'attendance',
    'staff',
    staffId,
    dateRange,
  ],
  classAttendance: (classId, section, date) => [
    'attendance',
    'class',
    classId,
    section,
    date,
  ],
  todayAttendance: ['attendance', 'today'],
  exam: id => ['exams', id],
  examSchedule: (classId, section) => ['exams', 'schedule', classId, section],
  examResults: (examId, studentId) => ['exams', examId, 'results', studentId],
  feesSummary: ['fees', 'summary'],
  studentFees: studentId => ['fees', 'student', studentId],
  notice: id => ['notices', id],
  homeworkByClass: (classId, section) => [
    'homework',
    'class',
    classId,
    section,
  ],
  studentHomework: studentId => ['homework', 'student', studentId],
  admissions: ['admissions'],
  admission: id => ['admissions', id],
  leaveRequests: ['leaveRequests'],
  leaveRequest: id => ['leaveRequests', id],
  userLeaveRequests: userId => ['leaveRequests', 'user', userId],
}

export default queryClient
