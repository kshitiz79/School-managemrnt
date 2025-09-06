import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { queryKeys } from '../lib/queryClient'

// Students hooks
export const useStudents = (filters = {}) => {
  return useQuery({
    queryKey: [...queryKeys.students.all, filters],
    queryFn: () => api.students.getAll(filters),
  })
}

export const useStudent = id => {
  return useQuery({
    queryKey: queryKeys.student(id),
    queryFn: () => api.students.getById(id),
    enabled: !!id,
  })
}

export const useStudentsByClass = (classId, section) => {
  return useQuery({
    queryKey: queryKeys.studentsByClass(classId, section),
    queryFn: () => api.students.getByClass(classId, section),
    enabled: !!classId,
  })
}

export const useCreateStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.students.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all })
    },
  })
}

export const useUpdateStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => api.students.update(id, data),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all })
      queryClient.setQueryData(queryKeys.student(data.id), data)
    },
  })
}

export const useDeleteStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.students.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all })
    },
  })
}

// Staff hooks
export const useStaff = (filters = {}) => {
  return useQuery({
    queryKey: [...queryKeys.staff.all, filters],
    queryFn: () => api.staff.getAll(filters),
  })
}

export const useStaffMember = id => {
  return useQuery({
    queryKey: queryKeys.staffMember(id),
    queryFn: () => api.staff.getById(id),
    enabled: !!id,
  })
}

export const useTeachers = () => {
  return useQuery({
    queryKey: queryKeys.teachers,
    queryFn: () => api.staff.getTeachers(),
  })
}

export const useCreateStaff = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.staff.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all })
    },
  })
}

// Classes hooks
export const useClasses = () => {
  return useQuery({
    queryKey: queryKeys.classes.all,
    queryFn: () => api.classes.getAll(),
  })
}

export const useClass = id => {
  return useQuery({
    queryKey: queryKeys.class(id),
    queryFn: () => api.classes.getById(id),
    enabled: !!id,
  })
}

export const useSections = classId => {
  return useQuery({
    queryKey: queryKeys.sections(classId),
    queryFn: () => api.classes.getSections(classId),
    enabled: !!classId,
  })
}

// Subjects hooks
export const useSubjects = () => {
  return useQuery({
    queryKey: queryKeys.subjects.all,
    queryFn: () => api.subjects.getAll(),
  })
}

// Attendance hooks
export const useAttendance = (filters = {}) => {
  return useQuery({
    queryKey: [...queryKeys.attendance.all, filters],
    queryFn: () => api.attendance.getAll(filters),
  })
}

export const useStudentAttendance = (studentId, dateRange = {}) => {
  return useQuery({
    queryKey: queryKeys.studentAttendance(studentId, dateRange),
    queryFn: () => api.attendance.getByUser(studentId, dateRange),
    enabled: !!studentId,
  })
}

export const useStaffAttendance = (staffId, dateRange = {}) => {
  return useQuery({
    queryKey: queryKeys.staffAttendance(staffId, dateRange),
    queryFn: () => api.attendance.getByUser(staffId, dateRange),
    enabled: !!staffId,
  })
}

export const useClassAttendance = (classId, section, date) => {
  return useQuery({
    queryKey: queryKeys.classAttendance(classId, section, date),
    queryFn: () => api.attendance.getByClass(classId, section, date),
    enabled: !!(classId && section && date),
  })
}

export const useTodayAttendance = () => {
  return useQuery({
    queryKey: queryKeys.todayAttendance,
    queryFn: () => api.attendance.getTodayAttendance(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

export const useMarkAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.attendance.markAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.todayAttendance })
    },
  })
}

// Exams hooks
export const useExams = (filters = {}) => {
  return useQuery({
    queryKey: [...queryKeys.exams.all, filters],
    queryFn: () => api.exams.getAll(filters),
  })
}

export const useExam = id => {
  return useQuery({
    queryKey: queryKeys.exam(id),
    queryFn: () => api.exams.getById(id),
    enabled: !!id,
  })
}

export const useExamSchedule = (classId, section) => {
  return useQuery({
    queryKey: queryKeys.examSchedule(classId, section),
    queryFn: () => api.exams.getSchedule(classId, section),
    enabled: !!classId,
  })
}

export const useExamResults = (examId, studentId) => {
  return useQuery({
    queryKey: queryKeys.examResults(examId, studentId),
    queryFn: () => api.exams.getResults(examId, studentId),
    enabled: !!examId,
  })
}

export const useCreateExam = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.exams.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exams.all })
    },
  })
}

export const useSubmitExamResult = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.exams.submitResult,
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.examResults(data.examId),
      })
    },
  })
}

// Fees hooks
export const useFeesSummary = () => {
  return useQuery({
    queryKey: queryKeys.feesSummary,
    queryFn: () => api.fees.getSummary(),
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  })
}

export const useStudentFees = studentId => {
  return useQuery({
    queryKey: queryKeys.studentFees(studentId),
    queryFn: () => api.fees.getStudentFees(studentId),
    enabled: !!studentId,
  })
}

export const useFeePayments = (filters = {}) => {
  return useQuery({
    queryKey: [...queryKeys.fees.all, 'payments', filters],
    queryFn: () => api.fees.payments.getAll(filters),
  })
}

export const useRecordPayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.fees.recordPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fees.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.feesSummary })
    },
  })
}

// Notices hooks
export const useNotices = (filters = {}) => {
  return useQuery({
    queryKey: [...queryKeys.notices.all, filters],
    queryFn: () => api.notices.getAll(filters),
  })
}

export const useNotice = id => {
  return useQuery({
    queryKey: queryKeys.notice(id),
    queryFn: () => api.notices.getById(id),
    enabled: !!id,
  })
}

export const useNoticesByAudience = audience => {
  return useQuery({
    queryKey: [...queryKeys.notices.all, 'audience', audience],
    queryFn: () => api.notices.getByAudience(audience),
    enabled: !!audience,
  })
}

export const useCreateNotice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.notices.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notices.all })
    },
  })
}

// Homework hooks
export const useHomework = (filters = {}) => {
  return useQuery({
    queryKey: [...queryKeys.homework.all, filters],
    queryFn: () => api.homework.homework.getAll(filters),
  })
}

export const useHomeworkByClass = (classId, section) => {
  return useQuery({
    queryKey: queryKeys.homeworkByClass(classId, section),
    queryFn: () => api.homework.getByClass(classId, section),
    enabled: !!(classId && section),
  })
}

export const useStudentHomework = studentId => {
  return useQuery({
    queryKey: queryKeys.studentHomework(studentId),
    queryFn: () => api.homework.getStudentHomework(studentId),
    enabled: !!studentId,
  })
}

export const useCreateHomework = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.homework.homework.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.homework.all })
    },
  })
}

export const useSubmitHomework = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.homework.submitHomework,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.homework.all })
    },
  })
}

// Admissions hooks
export const useAdmissions = (filters = {}) => {
  return useQuery({
    queryKey: [...queryKeys.admissions, filters],
    queryFn: () => api.admissions.getAll(filters),
  })
}

export const useAdmission = id => {
  return useQuery({
    queryKey: queryKeys.admission(id),
    queryFn: () => api.admissions.getById(id),
    enabled: !!id,
  })
}

export const useCreateAdmission = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.admissions.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admissions })
    },
  })
}

export const useProcessAdmission = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status, remarks }) =>
      api.admissions.processApplication(id, status, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admissions })
    },
  })
}

// Leave Requests hooks
export const useLeaveRequests = (filters = {}) => {
  return useQuery({
    queryKey: [...queryKeys.leaveRequests, filters],
    queryFn: () => api.leaveRequests.getAll(filters),
  })
}

export const useLeaveRequest = id => {
  return useQuery({
    queryKey: queryKeys.leaveRequest(id),
    queryFn: () => api.leaveRequests.getById(id),
    enabled: !!id,
  })
}

export const useUserLeaveRequests = userId => {
  return useQuery({
    queryKey: queryKeys.userLeaveRequests(userId),
    queryFn: () => api.leaveRequests.getByUser(userId),
    enabled: !!userId,
  })
}

export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.leaveRequests.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveRequests })
    },
  })
}

export const useApproveLeaveRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, remarks }) =>
      api.leaveRequests.approveRequest(id, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveRequests })
    },
  })
}

export const useRejectLeaveRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, remarks }) =>
      api.leaveRequests.rejectRequest(id, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveRequests })
    },
  })
}

// Dashboard hooks
export const useDashboardKpis = role => {
  return useQuery({
    queryKey: queryKeys.kpis(role),
    queryFn: () => api.dashboard.getKpis(role),
    enabled: !!role,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

// Generic hooks for any resource
export const useResource = (resourceName, filters = {}) => {
  return useQuery({
    queryKey: [resourceName, filters],
    queryFn: () => api[resourceName]?.getAll?.(filters),
    enabled: !!api[resourceName]?.getAll,
  })
}

export const useResourceById = (resourceName, id) => {
  return useQuery({
    queryKey: [resourceName, id],
    queryFn: () => api[resourceName]?.getById?.(id),
    enabled: !!(api[resourceName]?.getById && id),
  })
}

export const useCreateResource = resourceName => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: data => api[resourceName]?.create?.(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resourceName] })
    },
    enabled: !!api[resourceName]?.create,
  })
}

export const useUpdateResource = resourceName => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => api[resourceName]?.update?.(id, data),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: [resourceName] })
      if (data?.id) {
        queryClient.setQueryData([resourceName, data.id], data)
      }
    },
    enabled: !!api[resourceName]?.update,
  })
}

export const useDeleteResource = resourceName => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: id => api[resourceName]?.delete?.(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resourceName] })
    },
    enabled: !!api[resourceName]?.delete,
  })
}
