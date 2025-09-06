// HTTP Client for API calls
// This is a mock implementation that simulates HTTP requests

const delay = (ms = 500 + Math.random() * 1000) =>
  new Promise(resolve => setTimeout(resolve, ms))

const shouldSimulateError = (errorRate = 0.05) => Math.random() < errorRate

const createError = (status, message) => {
  const error = new Error(message)
  error.status = status
  return error
}

// Mock HTTP client that simulates axios-like behavior
export const httpClient = {
  get: async (url, config = {}) => {
    await delay()

    if (shouldSimulateError()) {
      throw createError(500, `Failed to GET ${url}`)
    }

    // Mock response based on URL
    const mockResponse = {
      data: getMockDataForUrl(url, config.params),
      status: 200,
      statusText: 'OK',
    }

    return mockResponse
  },

  post: async (url, data, config = {}) => {
    await delay()

    if (shouldSimulateError()) {
      throw createError(500, `Failed to POST ${url}`)
    }

    const mockResponse = {
      data: {
        id: `mock-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
      },
      status: 201,
      statusText: 'Created',
    }

    return mockResponse
  },

  put: async (url, data, config = {}) => {
    await delay()

    if (shouldSimulateError()) {
      throw createError(500, `Failed to PUT ${url}`)
    }

    const mockResponse = {
      data: {
        ...data,
        updatedAt: new Date().toISOString(),
      },
      status: 200,
      statusText: 'OK',
    }

    return mockResponse
  },

  delete: async (url, config = {}) => {
    await delay()

    if (shouldSimulateError()) {
      throw createError(500, `Failed to DELETE ${url}`)
    }

    const mockResponse = {
      data: { message: 'Deleted successfully' },
      status: 200,
      statusText: 'OK',
    }

    return mockResponse
  },
}

// Mock data generator based on URL patterns
function getMockDataForUrl(url, params = {}) {
  // Communication endpoints
  if (url.includes('/communication/scheduled')) {
    return [
      {
        id: 'sch-1',
        type: 'whatsapp',
        subject: 'School Event Reminder',
        content:
          'Reminder: Annual Sports Day is tomorrow at 9:00 AM. Please ensure your child comes in proper sports attire.',
        recipientCount: 150,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        createdAt: new Date().toISOString(),
        createdBy: 'Sarah Johnson',
        jobId: `job_${Math.random().toString(36).substr(2, 9)}`,
        status: 'scheduled',
      },
      {
        id: 'sch-2',
        type: 'email',
        subject: 'Monthly Fee Reminder',
        content:
          'Dear Parents, This is a reminder that the monthly fee payment is due on 10th of this month. Please make the payment to avoid late fees.',
        recipientCount: 200,
        scheduledAt: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(), // Next week
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'Lisa Wilson',
        jobId: `job_${Math.random().toString(36).substr(2, 9)}`,
        status: 'scheduled',
      },
      {
        id: 'sch-3',
        type: 'sms',
        subject: 'Exam Results',
        content:
          'Mid-term exam results have been published. Please check the student portal for detailed results.',
        recipientCount: 180,
        scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'John Smith',
        jobId: `job_${Math.random().toString(36).substr(2, 9)}`,
        status: 'sent',
      },
      {
        id: 'sch-4',
        type: 'whatsapp',
        subject: 'Holiday Notice',
        content:
          'School will remain closed on 15th August for Independence Day. Regular classes will resume from 16th August.',
        recipientCount: 250,
        scheduledAt: new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: 'Sarah Johnson',
        jobId: `job_${Math.random().toString(36).substr(2, 9)}`,
        status: 'processing',
      },
      {
        id: 'sch-5',
        type: 'email',
        subject: 'Parent-Teacher Meeting',
        content:
          'You are invited to attend the Parent-Teacher meeting scheduled for next Saturday at 10:00 AM in the school auditorium.',
        recipientCount: 120,
        scheduledAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'Emily Davis',
        jobId: `job_${Math.random().toString(36).substr(2, 9)}`,
        status: 'failed',
        error: 'SMTP server connection failed',
      },
    ]
  }

  if (url.includes('/communication/notices')) {
    return [
      {
        id: 'notice-1',
        title: 'School Reopening After Winter Break',
        content:
          'School will reopen on January 8th, 2024 after winter break. All students are expected to attend classes regularly.',
        type: 'general',
        priority: 'high',
        targetAudience: ['student', 'parent', 'staff'],
        publishedBy: 'Sarah Johnson',
        publishedAt: new Date().toISOString(),
        validUntil: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        status: 'published',
        attachments: [],
        isPinned: true,
      },
      {
        id: 'notice-2',
        title: 'Parent-Teacher Meeting',
        content:
          "Parent-Teacher meeting is scheduled for February 10th, 2024. Parents are requested to meet their ward's class teacher.",
        type: 'meeting',
        priority: 'medium',
        targetAudience: ['parent'],
        publishedBy: 'Sarah Johnson',
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        validUntil: new Date(
          Date.now() + 15 * 24 * 60 * 60 * 1000
        ).toISOString(),
        status: 'published',
        attachments: [],
        isPinned: false,
      },
    ]
  }

  if (url.includes('/communication/logs')) {
    return [
      {
        id: 'log-1',
        type: 'whatsapp',
        recipient: '+1234567890',
        recipientName: 'John Doe',
        subject: 'Fee Reminder',
        content: 'Your monthly fee payment is due tomorrow.',
        status: 'delivered',
        timestamp: new Date().toISOString(),
        gateway: 'WhatsApp',
        cost: 0.05,
      },
      {
        id: 'log-2',
        type: 'email',
        recipient: 'parent@example.com',
        recipientName: 'Jane Smith',
        subject: 'Exam Schedule',
        content: 'Please find attached the exam schedule for your child.',
        status: 'sent',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        gateway: 'Email',
        cost: 0.001,
      },
    ]
  }

  if (url.includes('/communication/templates/')) {
    const type = url.split('/templates/')[1]
    return [
      {
        id: 'template-1',
        name: `${type.toUpperCase()} Template 1`,
        subject: `Sample ${type} Subject`,
        content: `This is a sample ${type} template content.`,
        type: type,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
  }

  if (url.includes('/communication/gateway-status')) {
    return [
      {
        type: 'whatsapp',
        name: 'WhatsApp Gateway',
        status: 'active',
        successRate: 0.95,
        rateLimitInfo: {
          remaining: 45,
          limit: 50,
          resetTime: Date.now() + 3600000,
        },
        lastUsed: new Date().toISOString(),
      },
      {
        type: 'email',
        name: 'Email Gateway',
        status: 'active',
        successRate: 0.98,
        rateLimitInfo: {
          remaining: 450,
          limit: 500,
          resetTime: Date.now() + 3600000,
        },
        lastUsed: new Date().toISOString(),
      },
      {
        type: 'sms',
        name: 'SMS Gateway',
        status: 'active',
        successRate: 0.92,
        rateLimitInfo: {
          remaining: 180,
          limit: 200,
          resetTime: Date.now() + 3600000,
        },
        lastUsed: new Date().toISOString(),
      },
    ]
  }

  if (url.includes('/classes')) {
    return [
      { id: 'class-1', name: 'Class 1', sections: ['A', 'B'] },
      { id: 'class-2', name: 'Class 2', sections: ['A', 'B', 'C'] },
      { id: 'class-3', name: 'Class 3', sections: ['A', 'B'] },
      { id: 'class-4', name: 'Class 4', sections: ['A', 'B', 'C'] },
      { id: 'class-5', name: 'Class 5', sections: ['A', 'B'] },
      { id: 'class-6', name: 'Class 6', sections: ['A', 'B', 'C'] },
      { id: 'class-7', name: 'Class 7', sections: ['A', 'B'] },
      { id: 'class-8', name: 'Class 8', sections: ['A', 'B', 'C'] },
      { id: 'class-9', name: 'Class 9', sections: ['A', 'B'] },
      { id: 'class-10', name: 'Class 10', sections: ['A', 'B', 'C'] },
    ]
  }

  if (url.includes('/users/')) {
    const userType = url.split('/users/')[1]
    return [
      {
        id: 'user-1',
        name: `Sample ${userType}`,
        email: `${userType}@example.com`,
        phone: '+1234567890',
        type: userType,
      },
    ]
  }

  // Finance endpoints
  if (url.includes('/finance/expense-heads')) {
    return [
      {
        id: 1,
        name: 'Office Supplies',
        description: 'Stationery and office materials',
      },
      { id: 2, name: 'Utilities', description: 'Electricity, water, internet' },
      {
        id: 3,
        name: 'Maintenance',
        description: 'Building and equipment maintenance',
      },
    ]
  }

  if (url.includes('/finance/income-heads')) {
    return [
      { id: 1, name: 'Tuition Fees', description: 'Student tuition payments' },
      {
        id: 2,
        name: 'Admission Fees',
        description: 'New student admission fees',
      },
      { id: 3, name: 'Other Income', description: 'Miscellaneous income' },
    ]
  }

  if (url.includes('/finance/expenses')) {
    return [
      {
        id: 1,
        date: '2024-03-15',
        amount: 5000,
        description: 'Office supplies purchase',
        category: 'Office Supplies',
      },
    ]
  }

  if (url.includes('/finance/incomes')) {
    return [
      {
        id: 1,
        date: '2024-03-15',
        amount: 50000,
        description: 'Monthly tuition collection',
        category: 'Tuition Fees',
      },
    ]
  }

  // Default empty response
  return []
}

export default httpClient
