import mockData from '../mockData'

// Mock API for behavior management
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export const behaviourApi = {
  // Categories
  async getCategories() {
    await delay(300)

    const categories = [
      {
        id: 'disruptive',
        name: 'Disruptive Behavior',
        description: 'Behaviors that disrupt the learning environment',
        defaultSeverity: 'medium',
        points: 5,
        isActive: true,
        autoActions: [
          {
            threshold: 15,
            action: 'warning',
            description: 'Send warning to student',
          },
          {
            threshold: 25,
            action: 'parent_notification',
            description: 'Notify parents',
          },
        ],
      },
      {
        id: 'academic_dishonesty',
        name: 'Academic Dishonesty',
        description:
          'Cheating, plagiarism, or other forms of academic misconduct',
        defaultSeverity: 'high',
        points: 10,
        isActive: true,
        autoActions: [
          {
            threshold: 10,
            action: 'parent_notification',
            description: 'Immediate parent notification',
          },
          {
            threshold: 20,
            action: 'counselor_referral',
            description: 'Counselor referral',
          },
        ],
      },
      {
        id: 'bullying',
        name: 'Bullying/Harassment',
        description: 'Physical, verbal, or cyber bullying of other students',
        defaultSeverity: 'critical',
        points: 15,
        isActive: true,
        autoActions: [
          {
            threshold: 15,
            action: 'parent_notification',
            description: 'Immediate parent notification',
          },
          {
            threshold: 15,
            action: 'counselor_referral',
            description: 'Immediate counselor referral',
          },
        ],
      },
      {
        id: 'tardiness',
        name: 'Tardiness',
        description: 'Repeated late arrivals to class or school',
        defaultSeverity: 'low',
        points: 2,
        isActive: true,
        autoActions: [
          {
            threshold: 10,
            action: 'warning',
            description: 'Send tardiness warning',
          },
        ],
      },
      {
        id: 'uniform_violation',
        name: 'Uniform Violation',
        description: 'Not following school dress code or uniform policy',
        defaultSeverity: 'low',
        points: 1,
        isActive: true,
        autoActions: [],
      },
    ]

    return {
      success: true,
      data: categories,
    }
  },

  async createCategory(categoryData) {
    await delay(400)

    const newCategory = {
      id: `category-${Date.now()}`,
      ...categoryData,
      createdAt: new Date().toISOString(),
    }

    return {
      success: true,
      data: newCategory,
      message: 'Category created successfully',
    }
  },

  async updateCategory(id, categoryData) {
    await delay(400)

    return {
      success: true,
      data: {
        id,
        ...categoryData,
        updatedAt: new Date().toISOString(),
      },
      message: 'Category updated successfully',
    }
  },

  async deleteCategory(id) {
    await delay(300)

    return {
      success: true,
      message: 'Category deleted successfully',
    }
  },

  // Incidents
  async getIncidents(filters = {}) {
    await delay(600)

    // Generate mock incidents
    const incidents = [
      {
        id: 'incident-1',
        studentId: 'student-1',
        studentName: 'Alex Johnson',
        className: 'Class 10',
        section: 'A',
        categoryId: 'disruptive',
        categoryName: 'Disruptive Behavior',
        severity: 'medium',
        title: 'Talking during class',
        description:
          'Student was repeatedly talking and disrupting other students during math class.',
        location: 'Classroom 10A',
        date: '2024-02-08',
        time: '10:30',
        status: 'open',
        reportedBy: 'teacher-1',
        reportedByName: 'Mr. John Smith',
        reportedAt: '2024-02-08T10:35:00Z',
        actionTaken: 'Student was asked to move to front of class',
        witnesses: ['Ms. Emily Davis'],
        parentNotificationSent: false,
        followUpRequired: true,
        followUpDate: '2024-02-10',
        followUpActions: [],
      },
      {
        id: 'incident-2',
        studentId: 'student-2',
        studentName: 'Emma Smith',
        className: 'Class 9',
        section: 'B',
        categoryId: 'tardiness',
        categoryName: 'Tardiness',
        severity: 'low',
        title: 'Late to class',
        description:
          'Student arrived 15 minutes late to English class without valid reason.',
        location: 'Classroom 9B',
        date: '2024-02-07',
        time: '09:15',
        status: 'resolved',
        reportedBy: 'teacher-2',
        reportedByName: 'Ms. Emily Davis',
        reportedAt: '2024-02-07T09:20:00Z',
        actionTaken: 'Student was given detention',
        witnesses: [],
        parentNotificationSent: true,
        parentNotifiedAt: '2024-02-07T15:00:00Z',
        followUpRequired: false,
        followUpActions: [
          {
            description: 'Student completed detention',
            timestamp: '2024-02-07T16:00:00Z',
            user: 'Ms. Emily Davis',
          },
        ],
      },
      {
        id: 'incident-3',
        studentId: 'student-3',
        studentName: 'Michael Davis',
        className: 'Class 8',
        section: 'A',
        categoryId: 'academic_dishonesty',
        categoryName: 'Academic Dishonesty',
        severity: 'high',
        title: 'Cheating on test',
        description:
          "Student was caught looking at another student's paper during science test.",
        location: 'Science Lab',
        date: '2024-02-06',
        time: '11:00',
        status: 'in-progress',
        reportedBy: 'teacher-3',
        reportedByName: 'Dr. Michael Brown',
        reportedAt: '2024-02-06T11:15:00Z',
        actionTaken: 'Test was confiscated, student will retake',
        witnesses: ['Lab Assistant'],
        parentNotificationSent: true,
        parentNotifiedAt: '2024-02-06T14:00:00Z',
        followUpRequired: true,
        followUpDate: '2024-02-09',
        followUpActions: [],
      },
    ]

    return {
      success: true,
      data: incidents,
    }
  },

  async createIncident(incidentData) {
    await delay(500)

    const newIncident = {
      id: `incident-${Date.now()}`,
      ...incidentData,
      status: 'open',
      createdAt: new Date().toISOString(),
    }

    return {
      success: true,
      data: newIncident,
      message: 'Incident created successfully',
    }
  },

  async updateIncidentStatus(id, status, note) {
    await delay(400)

    return {
      success: true,
      data: {
        id,
        status,
        note,
        updatedAt: new Date().toISOString(),
      },
      message: 'Incident status updated successfully',
    }
  },

  async sendParentNotification(data) {
    await delay(600)

    return {
      success: true,
      message: 'Parent notification sent successfully',
    }
  },

  // Reports
  async getReports(filters = {}) {
    await delay(800)

    const reports = {
      summary: {
        totalIncidents: 45,
        studentsInvolved: 28,
        avgPerStudent: 1.6,
        avgPerDay: 2.3,
      },
      trends: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        value: Math.floor(Math.random() * 5) + 1,
      })).reverse(),
      categories: [
        { id: 'disruptive', name: 'Disruptive Behavior', count: 18 },
        { id: 'tardiness', name: 'Tardiness', count: 12 },
        { id: 'uniform_violation', name: 'Uniform Violation', count: 8 },
        { id: 'academic_dishonesty', name: 'Academic Dishonesty', count: 5 },
        { id: 'bullying', name: 'Bullying/Harassment', count: 2 },
      ],
      heatmap: mockData.classes.map(cls => ({
        className: cls.name,
        total: Math.floor(Math.random() * 10) + 5,
        low: Math.floor(Math.random() * 3) + 1,
        medium: Math.floor(Math.random() * 4) + 2,
        high: Math.floor(Math.random() * 2) + 1,
        critical: Math.floor(Math.random() * 1),
      })),
      students: mockData.students.slice(0, 15).map(student => ({
        ...student,
        totalIncidents: Math.floor(Math.random() * 8) + 1,
        low: Math.floor(Math.random() * 3),
        medium: Math.floor(Math.random() * 3),
        high: Math.floor(Math.random() * 2),
        critical: Math.floor(Math.random() * 1),
      })),
      classes: mockData.classes.map(cls => ({
        className: cls.name,
        totalStudents: Math.floor(Math.random() * 30) + 20,
        totalIncidents: Math.floor(Math.random() * 15) + 5,
        low: Math.floor(Math.random() * 5) + 1,
        medium: Math.floor(Math.random() * 6) + 2,
        high: Math.floor(Math.random() * 3) + 1,
        critical: Math.floor(Math.random() * 2),
      })),
      insights: {
        topCategory: 'Disruptive Behavior',
        peakTime: '10:00 AM - 11:00 AM',
        improvementRate: 15,
      },
    }

    return {
      success: true,
      data: reports,
    }
  },

  // Settings
  async getSettings() {
    await delay(300)

    const settings = {
      pointsSystem: {
        enablePoints: true,
        resetPeriod: 'semester',
        warningThreshold: 10,
        parentNotificationThreshold: 20,
        counselorReferralThreshold: 30,
        suspensionThreshold: 50,
      },
      notifications: {
        autoNotifyParents: true,
        emailNotifications: true,
        smsNotifications: false,
        notificationDelay: 30, // minutes
      },
    }

    return {
      success: true,
      data: settings,
    }
  },

  async updateSettings(settingsData) {
    await delay(400)

    return {
      success: true,
      data: settingsData,
      message: 'Settings updated successfully',
    }
  },

  // Search functions
  async searchStudents(query) {
    await delay(300)

    const students = mockData.students
      .filter(
        student =>
          student.name.toLowerCase().includes(query.toLowerCase()) ||
          student.rollNumber.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 10)

    return {
      success: true,
      data: students,
    }
  },

  async searchStaff(query) {
    await delay(300)

    const staff = mockData.staff
      .filter(
        member =>
          member.name.toLowerCase().includes(query.toLowerCase()) ||
          member.employeeId.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 10)

    return {
      success: true,
      data: staff,
    }
  },

  async getClasses() {
    await delay(200)

    return {
      success: true,
      data: mockData.classes,
    }
  },
}
