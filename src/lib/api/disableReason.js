import mockData from '../mockData'

// Mock API for disable reason management
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export const disableReasonApi = {
  // Disable Reasons
  async getDisableReasons(filters = {}) {
    await delay(600)

    const reasons = [
      {
        id: 'disable-1',
        studentId: 'student-1',
        studentName: 'Alex Johnson',
        className: 'Class 10',
        section: 'A',
        rollNumber: 'STU001',
        category: 'academic',
        severity: 'medium',
        reason:
          'Student has been temporarily suspended from examinations due to academic misconduct during the mid-term assessment.',
        startDate: '2024-02-01',
        endDate: '2024-02-15',
        isIndefinite: false,
        status: 'active',
        affectedAreas: ['Exams', 'Certificates', 'Reports'],
        additionalNotes:
          'Student must complete remedial classes before re-admission to examinations.',
        requiresApproval: true,
        notifyParents: true,
        disabledBy: 'Principal',
        createdAt: '2024-02-01T09:00:00Z',
        updatedAt: '2024-02-01T09:00:00Z',
      },
      {
        id: 'disable-2',
        studentId: 'student-2',
        studentName: 'Emma Smith',
        className: 'Class 9',
        section: 'B',
        rollNumber: 'STU002',
        category: 'financial',
        severity: 'high',
        reason:
          'Fee payment pending for the current term. Student access to online portal and library services has been restricted.',
        startDate: '2024-01-15',
        endDate: null,
        isIndefinite: true,
        status: 'active',
        affectedAreas: ['Online Portal', 'Library', 'Fee Payment', 'Reports'],
        additionalNotes:
          'Access will be restored upon full fee payment and clearance from accounts department.',
        requiresApproval: false,
        notifyParents: true,
        disabledBy: 'Accounts Manager',
        createdAt: '2024-01-15T11:30:00Z',
        updatedAt: '2024-01-15T11:30:00Z',
      },
      {
        id: 'disable-3',
        studentId: 'student-3',
        studentName: 'Michael Davis',
        className: 'Class 8',
        section: 'A',
        rollNumber: 'STU003',
        category: 'medical',
        severity: 'low',
        reason:
          'Student is on medical leave due to injury. Participation in sports and physical activities is restricted.',
        startDate: '2024-01-20',
        endDate: '2024-03-01',
        isIndefinite: false,
        status: 'active',
        affectedAreas: ['Sports', 'Events'],
        additionalNotes:
          'Medical clearance required before resuming physical activities. Regular academic activities can continue.',
        requiresApproval: false,
        notifyParents: true,
        disabledBy: 'School Nurse',
        createdAt: '2024-01-20T14:15:00Z',
        updatedAt: '2024-01-20T14:15:00Z',
      },
      {
        id: 'disable-4',
        studentId: 'student-4',
        studentName: 'Sarah Wilson',
        className: 'Class 7',
        section: 'C',
        rollNumber: 'STU004',
        category: 'disciplinary',
        severity: 'high',
        reason:
          'Student involved in serious disciplinary incident. Temporary suspension from all school activities pending investigation.',
        startDate: '2024-01-25',
        endDate: '2024-02-10',
        isIndefinite: false,
        status: 'resolved',
        affectedAreas: ['Exams', 'Assignments', 'Events', 'Library', 'Sports'],
        additionalNotes:
          'Investigation completed. Student has served suspension period and completed counseling sessions.',
        requiresApproval: true,
        notifyParents: true,
        disabledBy: 'Discipline Committee',
        createdAt: '2024-01-25T10:00:00Z',
        updatedAt: '2024-02-10T16:00:00Z',
      },
      {
        id: 'disable-5',
        studentId: 'student-5',
        studentName: 'David Brown',
        className: 'Class 6',
        section: 'A',
        rollNumber: 'STU005',
        category: 'technical',
        severity: 'low',
        reason:
          'Student account temporarily disabled due to technical issues with online portal access. IT team is working on resolution.',
        startDate: '2024-02-05',
        endDate: '2024-02-08',
        isIndefinite: false,
        status: 'expired',
        affectedAreas: ['Online Portal'],
        additionalNotes: 'Technical issue resolved. Account access restored.',
        requiresApproval: false,
        notifyParents: false,
        disabledBy: 'IT Administrator',
        createdAt: '2024-02-05T13:20:00Z',
        updatedAt: '2024-02-08T09:45:00Z',
      },
    ]

    return {
      success: true,
      data: reasons,
    }
  },

  async createDisableReason(reasonData) {
    await delay(500)

    const newReason = {
      id: `disable-${Date.now()}`,
      ...reasonData,
      status: 'active',
      disabledBy: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return {
      success: true,
      data: newReason,
      message: 'Disable reason created successfully',
    }
  },

  async updateDisableReason(id, reasonData) {
    await delay(400)

    return {
      success: true,
      data: {
        id,
        ...reasonData,
        updatedAt: new Date().toISOString(),
      },
      message: 'Disable reason updated successfully',
    }
  },

  async deleteDisableReason(id) {
    await delay(300)

    return {
      success: true,
      message: 'Disable reason deleted successfully',
    }
  },

  async resolveDisableReason(id, resolution) {
    await delay(400)

    return {
      success: true,
      data: {
        id,
        status: 'resolved',
        resolution,
        resolvedAt: new Date().toISOString(),
      },
      message: 'Disable reason resolved successfully',
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

  // Statistics
  async getDisableReasonStats() {
    await delay(400)

    const stats = {
      totalDisabled: 15,
      activeReasons: 8,
      expiredReasons: 4,
      resolvedReasons: 3,
      byCategory: {
        academic: 4,
        disciplinary: 3,
        medical: 2,
        financial: 3,
        administrative: 2,
        technical: 1,
      },
      bySeverity: {
        low: 6,
        medium: 5,
        high: 4,
      },
      expiringSoon: 2,
      indefiniteReasons: 3,
    }

    return {
      success: true,
      data: stats,
    }
  },
}
