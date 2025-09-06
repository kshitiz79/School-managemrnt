import mockData from './mockData.js'

// Simulate network latency
const delay = (ms = 500 + Math.random() * 1000) =>
  new Promise(resolve => setTimeout(resolve, ms))

// Simulate API errors occasionally
const shouldSimulateError = (errorRate = 0.05) => Math.random() < errorRate

const createError = (status, message) => {
  const error = new Error(message)
  error.status = status
  return error
}

// Generic CRUD operations
const createCrudApi = (resourceName, data) => ({
  getAll: async (filters = {}) => {
    await delay()
    if (shouldSimulateError()) {
      throw createError(500, `Failed to fetch ${resourceName}`)
    }

    let result = [...data]

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        result = result.filter(item => {
          if (typeof item[key] === 'string') {
            return item[key].toLowerCase().includes(value.toLowerCase())
          }
          return item[key] === value
        })
      }
    })

    return result
  },

  getById: async id => {
    await delay()
    if (shouldSimulateError()) {
      throw createError(500, `Failed to fetch ${resourceName}`)
    }

    const item = data.find(item => item.id === id)
    if (!item) {
      throw createError(404, `${resourceName} not found`)
    }

    return item
  },

  create: async newItem => {
    await delay()
    if (shouldSimulateError()) {
      throw createError(500, `Failed to create ${resourceName}`)
    }

    const item = {
      ...newItem,
      id: `${resourceName}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    data.push(item)
    return item
  },

  update: async (id, updates) => {
    await delay()
    if (shouldSimulateError()) {
      throw createError(500, `Failed to update ${resourceName}`)
    }

    const index = data.findIndex(item => item.id === id)
    if (index === -1) {
      throw createError(404, `${resourceName} not found`)
    }

    data[index] = {
      ...data[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    return data[index]
  },

  delete: async id => {
    await delay()
    if (shouldSimulateError()) {
      throw createError(500, `Failed to delete ${resourceName}`)
    }

    const index = data.findIndex(item => item.id === id)
    if (index === -1) {
      throw createError(404, `${resourceName} not found`)
    }

    const deleted = data.splice(index, 1)[0]
    return deleted
  },
})

// Students API
export const studentsApi = {
  ...createCrudApi('student', mockData.students),

  getByClass: async (classId, section) => {
    await delay()
    if (shouldSimulateError()) {
      throw createError(500, 'Failed to fetch students by class')
    }

    return mockData.students.filter(
      student =>
        student.classId === classId && (!section || student.section === section),
    )
  },

  getByParent: async parentEmail => {
    await delay()
    return mockData.students.filter(
      student => student.parentEmail === parentEmail,
    )
  },
}

// Staff API
export const staffApi = {
  ...createCrudApi('staff', mockData.staff),

  getTeachers: async () => {
    await delay()
    return mockData.staff.filter(member => member.role === 'teacher')
  },

  getByDepartment: async department => {
    await delay()
    return mockData.staff.filter(member => member.department === department)
  },
}

// Classes API
export const classesApi = {
  ...createCrudApi('class', mockData.classes),

  getSections: async classId => {
    await delay()
    const classData = mockData.classes.find(c => c.id === classId)
    if (!classData) {
      throw createError(404, 'Class not found')
    }

    return classData.sections.map(section => ({
      id: `${classId}-${section}`,
      name: section,
      classId,
      students: mockData.students.filter(
        s => s.classId === classId && s.section === section,
      ).length,
    }))
  },
}

// Subjects API
export const subjectsApi = createCrudApi('subject', mockData.subjects)

// Attendance API
export const attendanceApi = {
  ...createCrudApi('attendance', mockData.attendance),

  getByUser: async (userId, dateRange = {}) => {
    await delay()
    let records = mockData.attendance.filter(record => record.userId === userId)

    if (dateRange.start) {
      records = records.filter(record => record.date >= dateRange.start)
    }
    if (dateRange.end) {
      records = records.filter(record => record.date <= dateRange.end)
    }

    return records
  },

  getByClass: async (classId, section, date) => {
    await delay()
    const students = mockData.students.filter(
      s => s.classId === classId && s.section === section,
    )

    const attendanceRecords = mockData.attendance.filter(
      record => record.date === date && record.type === 'student',
    )

    return students.map(student => {
      const record = attendanceRecords.find(r => r.userId === student.id)
      return {
        student,
        attendance: record || {
          status: 'not_marked',
          date,
          userId: student.id,
        },
      }
    })
  },

  getTodayAttendance: async () => {
    await delay()
    const today = new Date().toISOString().split('T')[0]

    const studentAttendance = mockData.attendance.filter(
      record => record.date === today && record.type === 'student',
    )

    const staffAttendance = mockData.attendance.filter(
      record => record.date === today && record.type === 'staff',
    )

    const totalStudents = mockData.students.filter(
      s => s.status === 'active'
    ).length
    const totalStaff = mockData.staff.filter(s => s.status === 'active').length

    const presentStudents = studentAttendance.filter(
      r => r.status === 'present'
    ).length
    const presentStaff = staffAttendance.filter(
      r => r.status === 'present'
    ).length

    return {
      students: {
        total: totalStudents,
        present: presentStudents,
        absent: totalStudents - presentStudents,
        percentage:
          totalStudents > 0
            ? ((presentStudents / totalStudents) * 100).toFixed(1)
            : 0,
      },
      staff: {
        total: totalStaff,
        present: presentStaff,
        absent: totalStaff - presentStaff,
        percentage:
          totalStaff > 0 ? ((presentStaff / totalStaff) * 100).toFixed(1) : 0,
      },
    }
  },

  markAttendance: async attendanceData => {
    await delay()
    if (shouldSimulateError()) {
      throw createError(500, 'Failed to mark attendance')
    }

    const records = attendanceData.map(data => ({
      id: `att-${data.userId}-${data.date}`,
      ...data,
      markedAt: new Date().toISOString(),
    }))

    // Remove existing records for the same date and users
    mockData.attendance = mockData.attendance.filter(
      record =>
        !attendanceData.some(
          data => data.userId === record.userId && data.date === record.date,
        ),
    )

    mockData.attendance.push(...records)
    return records
  },
}

// Exams API
export const examsApi = {
  ...createCrudApi('exam', mockData.exams),

  getSchedule: async (classId, section) => {
    await delay()
    return mockData.exams.filter(
      exam => exam.classId === classId && (!section || exam.section === section),
    )
  },

  getResults: async (examId, studentId) => {
    await delay()
    let results = mockData.examResults.filter(
      result => result.examId === examId
    )

    if (studentId) {
      results = results.filter(result => result.studentId === studentId)
    }

    return results
  },

  submitResult: async resultData => {
    await delay()
    if (shouldSimulateError()) {
      throw createError(500, 'Failed to submit result')
    }

    const result = {
      id: `result-${Date.now()}`,
      ...resultData,
      evaluatedAt: new Date().toISOString(),
    }

    mockData.examResults.push(result)
    return result
  },
}

// Fees API
export const feesApi = {
  feeStructure: createCrudApi('fee-structure', mockData.feeStructure),
  payments: createCrudApi('fee-payment', mockData.feePayments),

  getSummary: async () => {
    await delay()
    const totalStudents = mockData.students.filter(
      s => s.status === 'active'
    ).length
    const totalFeeAmount = totalStudents * 5000 // Assuming 5000 per month

    const paidPayments = mockData.feePayments.filter(p => p.status === 'paid')
    const totalPaid = paidPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    )

    const pendingPayments = mockData.feePayments.filter(
      p => p.status === 'pending'
    )
    const totalPending = pendingPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    )

    return {
      totalAmount: totalFeeAmount,
      totalPaid,
      totalPending,
      collectionPercentage:
        totalFeeAmount > 0
          ? ((totalPaid / totalFeeAmount) * 100).toFixed(1)
          : 0,
      totalStudents,
      paidStudents: new Set(paidPayments.map(p => p.studentId)).size,
      pendingStudents: new Set(pendingPayments.map(p => p.studentId)).size,
    }
  },

  getStudentFees: async studentId => {
    await delay()
    const payments = mockData.feePayments.filter(p => p.studentId === studentId)
    const student = mockData.students.find(s => s.id === studentId)

    if (!student) {
      throw createError(404, 'Student not found')
    }

    return {
      student,
      payments,
      totalPaid: payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0),
      totalPending: payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0),
    }
  },

  recordPayment: async paymentData => {
    await delay()
    if (shouldSimulateError()) {
      throw createError(500, 'Failed to record payment')
    }

    const payment = {
      id: `payment-${Date.now()}`,
      ...paymentData,
      transactionId: `TXN${Date.now()}`,
      status: 'paid',
      createdAt: new Date().toISOString(),
    }

    mockData.feePayments.push(payment)
    return payment
  },
}

// Notices API
export const noticesApi = {
  ...createCrudApi('notice', mockData.notices),

  getByAudience: async audience => {
    await delay()
    return mockData.notices.filter(
      notice =>
        notice.targetAudience.includes(audience) &&
        notice.status === 'published' &&
        new Date(notice.validUntil) > new Date(),
    )
  },
}

// Homework API
export const homeworkApi = {
  homework: createCrudApi('homework', mockData.homework),
  submissions: createCrudApi(
    'homework-submission',
    mockData.homeworkSubmissions
  ),

  getByClass: async (classId, section) => {
    await delay()
    return mockData.homework.filter(
      hw => hw.classId === classId && hw.section === section,
    )
  },

  getStudentHomework: async studentId => {
    await delay()
    const student = mockData.students.find(s => s.id === studentId)
    if (!student) {
      throw createError(404, 'Student not found')
    }

    const homework = mockData.homework.filter(
      hw => hw.classId === student.classId && hw.section === student.section,
    )

    return homework.map(hw => {
      const submission = mockData.homeworkSubmissions.find(
        sub => sub.homeworkId === hw.id && sub.studentId === studentId,
      )

      return {
        ...hw,
        submission,
        status: submission ? submission.status : 'pending',
      }
    })
  },

  submitHomework: async submissionData => {
    await delay()
    if (shouldSimulateError()) {
      throw createError(500, 'Failed to submit homework')
    }

    const submission = {
      id: `sub-${Date.now()}`,
      ...submissionData,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
    }

    mockData.homeworkSubmissions.push(submission)
    return submission
  },
}

// Admissions API
export const admissionsApi = {
  ...createCrudApi('admission', mockData.admissions),

  processApplication: async (id, status, remarks) => {
    await delay()
    if (shouldSimulateError()) {
      throw createError(500, 'Failed to process application')
    }

    const index = mockData.admissions.findIndex(app => app.id === id)
    if (index === -1) {
      throw createError(404, 'Application not found')
    }

    mockData.admissions[index] = {
      ...mockData.admissions[index],
      status,
      remarks,
      processedBy: 'staff-1', // Current user
      processedAt: new Date().toISOString(),
    }

    return mockData.admissions[index]
  },
}

// Leave Requests API
export const leaveRequestsApi = {
  ...createCrudApi('leave-request', mockData.leaveRequests),

  getByUser: async userId => {
    await delay()
    return mockData.leaveRequests.filter(request => request.userId === userId)
  },

  approveRequest: async (id, remarks = '') => {
    await delay()
    if (shouldSimulateError()) {
      throw createError(500, 'Failed to approve leave request')
    }

    const index = mockData.leaveRequests.findIndex(req => req.id === id)
    if (index === -1) {
      throw createError(404, 'Leave request not found')
    }

    mockData.leaveRequests[index] = {
      ...mockData.leaveRequests[index],
      status: 'approved',
      remarks,
      approvedBy: 'staff-1', // Current user
      approvedAt: new Date().toISOString(),
    }

    return mockData.leaveRequests[index]
  },

  rejectRequest: async (id, remarks = '') => {
    await delay()
    if (shouldSimulateError()) {
      throw createError(500, 'Failed to reject leave request')
    }

    const index = mockData.leaveRequests.findIndex(req => req.id === id)
    if (index === -1) {
      throw createError(404, 'Leave request not found')
    }

    mockData.leaveRequests[index] = {
      ...mockData.leaveRequests[index],
      status: 'rejected',
      remarks,
      approvedBy: 'staff-1', // Current user
      approvedAt: new Date().toISOString(),
    }

    return mockData.leaveRequests[index]
  },
}

// Dashboard API
export const dashboardApi = {
  getKpis: async role => {
    await delay()

    const today = new Date().toISOString().split('T')[0]
    const attendanceToday = await attendanceApi.getTodayAttendance()

    switch (role) {
      case 'admin':
        return {
          totalUsers: mockData.students.length + mockData.staff.length,
          totalStudents: mockData.students.filter(s => s.status === 'active')
            .length,
          totalStaff: mockData.staff.filter(s => s.status === 'active').length,
          totalClasses: mockData.classes.length,
          attendanceRate: attendanceToday.students.percentage,
          feeCollection: (await feesApi.getSummary()).collectionPercentage,
        }

      case 'principal':
        return {
          totalStudents: mockData.students.filter(s => s.status === 'active')
            .length,
          totalTeachers: mockData.staff.filter(s => s.role === 'teacher')
            .length,
          attendanceRate: attendanceToday.students.percentage,
          pendingAdmissions: mockData.admissions.filter(
            a => a.status === 'pending'
          ).length,
        }

      case 'teacher':
        // Assuming current teacher teaches certain classes
        const teacherClasses = ['class-9', 'class-10']
        const teacherStudents = mockData.students.filter(s =>
          teacherClasses.includes(s.classId),
        )
        return {
          totalStudents: teacherStudents.length,
          totalClasses: teacherClasses.length,
          pendingHomework: mockData.homework.filter(hw =>
            teacherClasses.includes(hw.classId),
          ).length,
          upcomingExams: mockData.exams.filter(
            exam => teacherClasses.includes(exam.classId) && exam.date >= today,
          ).length,
        }

      case 'student':
        // Assuming current student
        const currentStudent = mockData.students[0]
        const studentHomework = await homeworkApi.getStudentHomework(
          currentStudent.id
        )
        return {
          totalSubjects: mockData.subjects.length,
          pendingHomework: studentHomework.filter(hw => hw.status === 'pending')
            .length,
          upcomingExams: mockData.exams.filter(
            exam =>
              exam.classId === currentStudent.classId &&
              exam.section === currentStudent.section &&
              exam.date >= today,
          ).length,
          attendanceRate: 92.5, // Mock percentage
        }

      case 'parent':
        const parentChildren = mockData.students.slice(0, 2) // Mock 2 children
        return {
          totalChildren: parentChildren.length,
          averageAttendance: 94.2,
          pendingFees: 2,
          upcomingEvents: 3,
        }

      case 'accountant':
        const feesSummary = await feesApi.getSummary()
        return {
          totalCollection: feesSummary.totalPaid,
          pendingAmount: feesSummary.totalPending,
          collectionRate: feesSummary.collectionPercentage,
          totalTransactions: mockData.feePayments.length,
        }

      default:
        return {}
    }
  },
}

export default {
  students: studentsApi,
  staff: staffApi,
  classes: classesApi,
  subjects: subjectsApi,
  attendance: attendanceApi,
  exams: examsApi,
  fees: feesApi,
  notices: noticesApi,
  homework: homeworkApi,
  admissions: admissionsApi,
  leaveRequests: leaveRequestsApi,
  dashboard: dashboardApi,
}
