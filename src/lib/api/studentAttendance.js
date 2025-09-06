import mockData from '../mockData'

// Mock API for student attendance
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export const studentAttendanceApi = {
  async getAttendance(params) {
    await delay(500)

    const { classId, sectionId, date, type, period } = params

    // Get students for the class and section
    const students = mockData.students.filter(
      student => student.classId === classId && student.section === sectionId,
    )

    // Generate mock attendance data
    const attendanceRecords = students.map(student => {
      const statuses = ['present', 'absent', 'late']
      const weights = [0.85, 0.1, 0.05] // 85% present, 10% absent, 5% late

      let status = 'present'
      const rand = Math.random()
      let cumulative = 0

      for (let i = 0; i < statuses.length; i++) {
        cumulative += weights[i]
        if (rand <= cumulative) {
          status = statuses[i]
          break
        }
      }

      return {
        studentId: student.id,
        status,
        reason: status === 'absent' ? 'Sick leave' : '',
        timeIn: status !== 'absent' ? '09:00' : null,
        timeOut: status !== 'absent' ? '15:30' : null,
        markedBy: 'teacher-1',
        markedAt: new Date().toISOString(),
      }
    })

    return {
      success: true,
      data: attendanceRecords,
    }
  },

  async saveAttendance(data) {
    await delay(400)

    return {
      success: true,
      message: 'Attendance saved successfully',
      data: {
        id: `attendance-${Date.now()}`,
        ...data,
        savedAt: new Date().toISOString(),
      },
    }
  },

  async bulkMark(data) {
    await delay(600)

    return {
      success: true,
      message: `Bulk attendance marked for ${data.studentIds.length} students`,
      data: {
        affected: data.studentIds.length,
        status: data.status,
        date: data.date,
      },
    }
  },

  async getTrends(params) {
    await delay(700)

    const { classId, sectionId, days = 7 } = params

    // Generate mock trend data
    const trends = []
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      const total = mockData.students.filter(
        s => s.classId === classId && s.section === sectionId,
      ).length

      const attendanceRate = 0.8 + Math.random() * 0.15 // 80-95%
      const present = Math.floor(total * attendanceRate)
      const absent = Math.floor((total - present) * 0.8)
      const late = total - present - absent

      trends.push({
        date: date.toISOString().split('T')[0],
        total,
        present,
        absent,
        late,
      })
    }

    return {
      success: true,
      data: trends,
    }
  },

  async getAttendanceCorrections(params) {
    await delay(500)

    // Mock corrections data
    const corrections = [
      {
        id: 'correction-1',
        studentId: 'student-1',
        studentName: 'Alex Johnson',
        date: '2024-02-08',
        originalStatus: 'absent',
        correctedStatus: 'present',
        reason: 'Student was present but not marked',
        correctedBy: 'teacher-1',
        correctedAt: '2024-02-09T10:00:00Z',
      },
    ]

    return {
      success: true,
      data: corrections,
    }
  },

  async submitCorrection(data) {
    await delay(400)

    return {
      success: true,
      message: 'Attendance correction submitted successfully',
      data: {
        id: `correction-${Date.now()}`,
        ...data,
        submittedAt: new Date().toISOString(),
      },
    }
  },
}
