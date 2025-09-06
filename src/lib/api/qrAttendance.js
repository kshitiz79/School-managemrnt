import mockData from '../mockData'

// Mock API for QR attendance
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export const qrAttendanceApi = {
  async getClasses() {
    await delay(200)

    return {
      success: true,
      data: mockData.classes,
    }
  },

  async generateQR(qrData) {
    await delay(300)

    const qrCode = {
      id: `qr-${Date.now()}`,
      ...qrData,
      qrString: `QR_ATT_${qrData.timestamp}_${qrData.classId}_${qrData.section}_${qrData.period || 'DAILY'}`,
      generatedAt: new Date().toISOString(),
      isActive: true,
    }

    return {
      success: true,
      data: qrCode,
    }
  },

  async processScan(scanData) {
    await delay(400)

    // Mock scan processing
    const student = mockData.students.find(s => s.id === scanData.studentId)
    const isSuccess = Math.random() > 0.1 // 90% success rate
    const isDuplicate = Math.random() > 0.8 // 20% duplicate rate

    let status = 'success'
    if (isDuplicate) status = 'duplicate'
    else if (!isSuccess) status = 'failed'

    const scanEvent = {
      id: `scan-${Date.now()}`,
      studentId: scanData.studentId,
      studentName: student?.name || 'Unknown Student',
      classId: scanData.qrData.classId,
      className:
        mockData.classes.find(c => c.id === scanData.qrData.classId)?.name ||
        'Unknown Class',
      section: scanData.qrData.section,
      period: scanData.qrData.period,
      timestamp: scanData.timestamp,
      status,
      qrId: scanData.qrData.id || 'unknown',
    }

    return {
      success: true,
      data: scanEvent,
    }
  },

  async getScanEvents(date) {
    await delay(500)

    // Generate mock scan events for the day
    const events = []
    const eventCount = Math.floor(Math.random() * 20) + 10 // 10-30 events

    for (let i = 0; i < eventCount; i++) {
      const student =
        mockData.students[Math.floor(Math.random() * mockData.students.length)]
      const cls =
        mockData.classes[Math.floor(Math.random() * mockData.classes.length)]
      const statuses = ['success', 'duplicate', 'failed']
      const status = statuses[Math.floor(Math.random() * statuses.length)]

      const timestamp = new Date(date)
      timestamp.setHours(8 + Math.floor(Math.random() * 8)) // 8 AM to 4 PM
      timestamp.setMinutes(Math.floor(Math.random() * 60))

      events.push({
        id: `scan-event-${i}`,
        studentId: student.id,
        studentName: student.name,
        classId: cls.id,
        className: cls.name,
        section: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        period: Math.floor(Math.random() * 8) + 1,
        timestamp: timestamp.toISOString(),
        status,
      })
    }

    // Sort by timestamp (newest first)
    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    return {
      success: true,
      data: events,
    }
  },

  async getQRStats(date) {
    await delay(300)

    const stats = {
      activeQRs: Math.floor(Math.random() * 5) + 1,
      totalScans: Math.floor(Math.random() * 100) + 50,
      successfulScans: Math.floor(Math.random() * 80) + 40,
      failedScans: Math.floor(Math.random() * 10) + 5,
      duplicateScans: Math.floor(Math.random() * 15) + 5,
    }

    return {
      success: true,
      data: stats,
    }
  },

  async deactivateQR(qrId) {
    await delay(200)

    return {
      success: true,
      message: 'QR code deactivated successfully',
    }
  },
}
