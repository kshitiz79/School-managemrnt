import mockData from '../mockData'

// Mock API for general attendance operations
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export const attendanceApi = {
  async getByDate(date) {
    await delay(600)

    // Generate mock attendance data by class for the given date
    const attendanceByClass = mockData.classes
      .map(cls => {
        const sections = ['A', 'B', 'C']

        return sections
          .map(section => {
            // Get students for this class and section
            const classStudents = mockData.students.filter(
              student =>
                student.classId === cls.id && student.section === section,
            )

            if (classStudents.length === 0) return null

            // Generate random attendance numbers
            const total = classStudents.length
            const presentRate = 0.85 + Math.random() * 0.1 // 85-95% attendance
            const present = Math.floor(total * presentRate)
            const absent = Math.floor((total - present) * 0.8) // 80% of non-present are absent
            const late = total - present - absent

            return {
              classId: cls.id,
              className: cls.name,
              section,
              total,
              present,
              absent,
              late,
              date,
            }
          })
          .filter(Boolean)
      })
      .flat()

    return {
      success: true,
      data: attendanceByClass,
    }
  },

  async getClasses() {
    await delay(200)

    return {
      success: true,
      data: mockData.classes,
    }
  },

  async getTrends(filters = {}) {
    await delay(700)

    // Generate mock trend data for the last 7 days
    const trends = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      const totalStudents = mockData.students.length
      const attendanceRate = 0.8 + Math.random() * 0.15 // 80-95%
      const present = Math.floor(totalStudents * attendanceRate)
      const absent = Math.floor((totalStudents - present) * 0.8)
      const late = totalStudents - present - absent

      trends.push({
        date: date.toISOString().split('T')[0],
        total: totalStudents,
        present,
        absent,
        late,
        attendanceRate: Math.round(attendanceRate * 100),
      })
    }

    return {
      success: true,
      data: trends,
    }
  },

  async getDetailedAttendance(classId, section, date) {
    await delay(500)

    // Get students for the specific class and section
    const students = mockData.students.filter(
      student => student.classId === classId && student.section === section,
    )

    // Generate attendance records for each student
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
        studentName: student.name,
        rollNumber: student.rollNumber,
        status,
        timeIn: status !== 'absent' ? '09:00' : null,
        timeOut: status !== 'absent' ? '15:30' : null,
        reason: status === 'absent' ? 'Sick leave' : '',
        markedBy: 'teacher-1',
        markedAt: new Date().toISOString(),
      }
    })

    return {
      success: true,
      data: {
        classId,
        className: mockData.classes.find(c => c.id === classId)?.name,
        section,
        date,
        students: attendanceRecords,
      },
    }
  },

  async exportReport(filters = {}) {
    await delay(1000)

    // Mock export functionality
    return {
      success: true,
      data: {
        downloadUrl: '/api/attendance/export/report.xlsx',
        filename: `attendance_report_${new Date().toISOString().split('T')[0]}.xlsx`,
      },
    }
  },
}
