import mockData from '../mockData'

// Mock API for leave requests
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export const leaveRequestsApi = {
  async getPendingRequests() {
    await delay(500)

    // Generate mock leave requests
    const requests = [
      {
        id: 'leave-1',
        userId: 'student-1',
        userType: 'student',
        userName: 'Alex Johnson',
        rollNumber: 'STU001',
        type: 'sick',
        startDate: '2024-02-10',
        endDate: '2024-02-12',
        reason: 'Fever and cold symptoms',
        status: 'pending',
        appliedAt: '2024-02-08T10:00:00Z',
        attachments: ['medical_certificate.pdf'],
        remarks: '',
      },
      {
        id: 'leave-2',
        userId: 'student-2',
        userType: 'student',
        userName: 'Emma Smith',
        rollNumber: 'STU002',
        type: 'personal',
        startDate: '2024-02-15',
        endDate: '2024-02-15',
        reason: 'Family wedding ceremony',
        status: 'pending',
        appliedAt: '2024-02-12T14:30:00Z',
        attachments: [],
        remarks: '',
      },
      {
        id: 'leave-3',
        userId: 'staff-3',
        userType: 'staff',
        userName: 'Ms. Emily Davis',
        employeeId: 'EMP003',
        type: 'personal',
        startDate: '2024-02-20',
        endDate: '2024-02-21',
        reason: 'Personal work',
        status: 'approved',
        appliedAt: '2024-02-10T09:15:00Z',
        approvedBy: 'staff-1',
        approvedAt: '2024-02-11T11:00:00Z',
        attachments: [],
        remarks: 'Approved with substitute teacher arrangement',
      },
      {
        id: 'leave-4',
        userId: 'student-3',
        userType: 'student',
        userName: 'Michael Davis',
        rollNumber: 'STU003',
        type: 'emergency',
        startDate: '2024-02-08',
        endDate: '2024-02-09',
        reason: 'Family emergency - hospitalization',
        status: 'rejected',
        appliedAt: '2024-02-07T16:45:00Z',
        approvedBy: 'staff-1',
        approvedAt: '2024-02-08T08:30:00Z',
        attachments: [],
        remarks: 'Insufficient documentation provided',
      },
    ]

    return {
      success: true,
      data: requests,
    }
  },

  async approve(requestId, remarks) {
    await delay(300)

    return {
      success: true,
      message: 'Leave request approved successfully',
      data: {
        id: requestId,
        status: 'approved',
        approvedBy: 'current-user',
        approvedAt: new Date().toISOString(),
        remarks,
      },
    }
  },

  async reject(requestId, remarks) {
    await delay(300)

    return {
      success: true,
      message: 'Leave request rejected',
      data: {
        id: requestId,
        status: 'rejected',
        approvedBy: 'current-user',
        approvedAt: new Date().toISOString(),
        remarks,
      },
    }
  },

  async getLeaveHistory(filters = {}) {
    await delay(500)

    // Mock leave history data
    const history = []

    return {
      success: true,
      data: history,
    }
  },
}
