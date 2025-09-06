import mockData from '../mockData'

// Mock API for staff attendance
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export const staffAttendanceApi = {
  async getAttendance(date) {
    await delay(500)

    // Generate mock staff attendance data
    const staffWithAttendance = mockData.staff.map(staff => {
      const hasAttendance = Math.random() > 0.2 // 80% have attendance marked

      let attendance = null
      if (hasAttendance) {
        const statuses = ['present', 'absent', 'late', 'half-day']
        const status = statuses[Math.floor(Math.random() * statuses.length)]

        attendance = {
          id: `att-${staff.id}-${date}`,
          staffId: staff.id,
          date,
          status,
          timeIn: status !== 'absent' ? '09:00' : '',
          timeOut: status !== 'absent' ? '17:00' : '',
          remarks:
            status === 'late'
              ? 'Traffic delay'
              : status === 'half-day'
                ? 'Medical appointment'
                : '',
          markedBy: 'admin',
          markedAt: new Date().toISOString(),
        }
      }

      return {
        ...staff,
        attendance,
      }
    })

    return {
      success: true,
      data: staffWithAttendance,
    }
  },

  async saveAttendance(attendanceData) {
    await delay(300)

    return {
      success: true,
      message: 'Attendance saved successfully',
      data: {
        id: `att-${attendanceData.staffId}-${attendanceData.date}`,
        ...attendanceData,
        markedAt: new Date().toISOString(),
      },
    }
  },

  async bulkMark(bulkData) {
    await delay(500)

    return {
      success: true,
      message: `Bulk attendance marked for ${bulkData.staffIds.length} staff members`,
      data: {
        affected: bulkData.staffIds.length,
        date: bulkData.date,
        status: bulkData.status,
      },
    }
  },

  async getDepartments() {
    await delay(200)

    const departments = [
      ...new Set(mockData.staff.map(staff => staff.department)),
    ]

    return {
      success: true,
      data: departments,
    }
  },

  async getAttendanceReport(filters = {}) {
    await delay(800)

    // Mock report data
    const report = {
      summary: {
        totalStaff: mockData.staff.length,
        present: Math.floor(mockData.staff.length * 0.85),
        absent: Math.floor(mockData.staff.length * 0.1),
        late: Math.floor(mockData.staff.length * 0.05),
      },
      trends: [],
      departmentWise: [],
    }

    return {
      success: true,
      data: report,
    }
  },
}
