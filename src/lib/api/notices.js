// Mock API for notice management
import { noticeSchema } from '../validators'

// In-memory store
let noticesStore = []
let nextId = 1

// Simulate API latency
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Generate realistic notice data
const generateNotices = () => {
  const noticeTypes = [
    'general',
    'academic',
    'event',
    'holiday',
    'urgent',
    'circular',
  ]
  const priorities = ['low', 'medium', 'high']
  const audiences = [
    ['student', 'parent'],
    ['staff', 'teacher'],
    ['all'],
    ['student'],
    ['parent'],
    ['teacher'],
  ]

  const sampleNotices = [
    {
      title: 'School Reopening After Winter Break',
      content:
        'Dear Students and Parents,\n\nWe are pleased to inform you that the school will reopen on January 8th, 2024, after the winter break. All students are expected to attend classes regularly from the first day.\n\nPlease ensure that students come prepared with all necessary books and materials.\n\nThank you.',
      type: 'general',
      priority: 'high',
      targetAudience: ['student', 'parent'],
      validUntil: '2024-01-15T23:59:59Z',
    },
    {
      title: 'Parent-Teacher Meeting Scheduled',
      content:
        "We are organizing a Parent-Teacher Meeting on February 10th, 2024, from 2:00 PM to 5:00 PM. Parents are requested to meet their ward's class teacher to discuss academic progress.\n\nPlease bring your child's progress report and any concerns you may have.\n\nVenue: Respective Classrooms\nTime: 2:00 PM - 5:00 PM",
      type: 'event',
      priority: 'medium',
      targetAudience: ['parent'],
      validUntil: '2024-02-10T23:59:59Z',
    },
    {
      title: 'Annual Sports Day - March 15th',
      content:
        'We are excited to announce our Annual Sports Day on March 15th, 2024. All students are encouraged to participate in various sports activities.\n\nRegistration for events will begin from March 1st. Please contact your Physical Education teacher for more details.\n\nParents are cordially invited to attend and cheer for their children.',
      type: 'event',
      priority: 'medium',
      targetAudience: ['student', 'parent', 'staff'],
      validUntil: '2024-03-15T23:59:59Z',
    },
    {
      title: 'Mid-Term Examination Schedule',
      content:
        'The Mid-Term Examinations for all classes will be conducted from February 20th to February 28th, 2024.\n\nDetailed time table will be shared with students by February 15th. Students are advised to prepare well and follow the examination guidelines.\n\nSyllabus coverage:\n- Classes 1-5: All topics covered till January\n- Classes 6-10: First two units of each subject\n- Classes 11-12: As per the academic calendar',
      type: 'academic',
      priority: 'high',
      targetAudience: ['student', 'parent'],
      validUntil: '2024-02-28T23:59:59Z',
    },
    {
      title: 'Library Books Return Reminder',
      content:
        'This is a reminder to all students who have borrowed books from the library. Please return all borrowed books by January 31st, 2024.\n\nFine for late return:\n- ₹2 per day for regular books\n- ₹5 per day for reference books\n\nFor any queries, please contact the librarian.',
      type: 'general',
      priority: 'low',
      targetAudience: ['student'],
      validUntil: '2024-01-31T23:59:59Z',
    },
    {
      title: 'Staff Meeting - January 25th',
      content:
        'All teaching and non-teaching staff are required to attend the monthly staff meeting on January 25th, 2024, at 4:00 PM in the conference hall.\n\nAgenda:\n1. Academic progress review\n2. Upcoming events planning\n3. Infrastructure updates\n4. Policy changes\n\nPlease be punctual.',
      type: 'general',
      priority: 'medium',
      targetAudience: ['staff', 'teacher'],
      validUntil: '2024-01-25T23:59:59Z',
    },
    {
      title: 'Republic Day Celebration',
      content:
        'We will be celebrating Republic Day on January 26th, 2024, with great enthusiasm.\n\nProgram Schedule:\n- 8:00 AM: Flag Hoisting\n- 8:30 AM: Cultural Programs\n- 10:00 AM: Prize Distribution\n- 10:30 AM: Refreshments\n\nAll students should be in school uniform. Parents are welcome to join the celebration.',
      type: 'holiday',
      priority: 'medium',
      targetAudience: ['all'],
      validUntil: '2024-01-26T23:59:59Z',
    },
    {
      title: 'Fee Payment Deadline Extended',
      content:
        'Due to technical issues with the online payment system, the fee payment deadline has been extended to February 5th, 2024.\n\nPayment can be made through:\n- Online portal (once restored)\n- Bank transfer\n- Cash/Cheque at school office\n\nFor any assistance, contact the accounts department.',
      type: 'urgent',
      priority: 'high',
      targetAudience: ['parent'],
      validUntil: '2024-02-05T23:59:59Z',
    },
    {
      title: 'Science Exhibition - Call for Participation',
      content:
        'We are organizing a Science Exhibition on March 20th, 2024. Students from classes 6-12 are invited to participate with innovative science projects.\n\nRegistration deadline: March 1st, 2024\nThemes: Environment, Technology, Health, Space\n\nPrizes will be awarded to the best projects in each category. For registration, contact your science teachers.',
      type: 'academic',
      priority: 'medium',
      targetAudience: ['student', 'parent'],
      validUntil: '2024-03-01T23:59:59Z',
    },
    {
      title: 'New School Bus Route Added',
      content:
        'We are pleased to announce a new school bus route covering the following areas:\n\n- Sector 15\n- Sector 16\n- Sector 17\n- Model Town\n\nBus timing: 7:30 AM pickup, 3:45 PM drop\nMonthly fee: ₹1,200\n\nInterested parents can contact the transport coordinator for registration.',
      type: 'general',
      priority: 'low',
      targetAudience: ['parent'],
      validUntil: '2024-03-31T23:59:59Z',
    }
  ]

  const notices = []

  sampleNotices.forEach((notice, index) => {
    const publishedDate = new Date()
    publishedDate.setDate(
      publishedDate.getDate() - Math.floor(Math.random() * 30)

    notices.push({
      id: `notice-${index + 1}`,
      title: notice.title,
      content: notice.content,
      type: notice.type,
      priority: notice.priority,
      targetAudience: notice.targetAudience,
      publishedBy: `staff-${Math.floor(Math.random() * 5) + 1}`,
      publishedAt: publishedDate.toISOString(),
      validUntil: notice.validUntil,
      status: 'published',
      attachments: Math.random() > 0.8 ? [`attachment-${index + 1}.pdf`] : [],
      classes: notice.targetAudience.includes('student')
        ? Math.random() > 0.5
          ? []
          : [`${Math.floor(Math.random() * 12) + 1}`]
        : [],
      views: Math.floor(Math.random() * 500) + 50,
      createdAt: publishedDate.toISOString(),
      updatedAt: publishedDate.toISOString(),
    })
  })

  // Add some additional random notices
  for (let i = 10; i < 25; i++) {
    const type = noticeTypes[Math.floor(Math.random() * noticeTypes.length)]
    const priority = priorities[Math.floor(Math.random() * priorities.length)]
    const audience = audiences[Math.floor(Math.random() * audiences.length)]

    const publishedDate = new Date()
    publishedDate.setDate(
      publishedDate.getDate() - Math.floor(Math.random() * 60)

    const validUntil = new Date(publishedDate)
    validUntil.setDate(
      validUntil.getDate() + Math.floor(Math.random() * 30) + 7

    notices.push({
      id: `notice-${i + 1}`,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Notice ${i + 1}`,
      content: `This is a sample ${type} notice with ${priority} priority. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`,
      type: type,
      priority: priority,
      targetAudience: audience,
      publishedBy: `staff-${Math.floor(Math.random() * 5) + 1}`,
      publishedAt: publishedDate.toISOString(),
      validUntil: validUntil.toISOString(),
      status: Math.random() > 0.1 ? 'published' : 'draft',
      attachments: Math.random() > 0.7 ? [`attachment-${i + 1}.pdf`] : [],
      classes: audience.includes('student')
        ? Math.random() > 0.6
          ? []
          : [`${Math.floor(Math.random() * 12) + 1}`]
        : [],
      views: Math.floor(Math.random() * 300) + 10,
      createdAt: publishedDate.toISOString(),
      updatedAt: publishedDate.toISOString(),
    })
  }

  return notices
}

// Initialize store
noticesStore = generateNotices()
nextId = noticesStore.length + 1

// API functions
export const noticesApi = {
  // Get all notices with filtering and pagination
  getNotices: async (params = {}) => {
    await delay()

    const {
      page = 1,
      limit = 10,
      search = '',
      type = '',
      priority = '',
      targetAudience = '',
      status = '',
      publishedBy = '',
      sortBy = 'publishedAt',
      sortOrder = 'desc',
    } = params

    let filtered = [...noticesStore]

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        notice =>
          notice.title.toLowerCase().includes(searchLower) ||
          notice.content.toLowerCase().includes(searchLower),
      )
    }

    if (type) {
      filtered = filtered.filter(notice => notice.type === type)
    }

    if (priority) {
      filtered = filtered.filter(notice => notice.priority === priority)
    }

    if (targetAudience) {
      filtered = filtered.filter(notice =>
        notice.targetAudience.includes(targetAudience),
      )
    }

    if (status) {
      filtered = filtered.filter(notice => notice.status === status)
    }

    if (publishedBy) {
      filtered = filtered.filter(notice => notice.publishedBy === publishedBy)
    }

    // Filter out expired notices (unless specifically requested)
    if (!params.includeExpired) {
      const now = new Date().toISOString()
      filtered = filtered.filter(
        notice => !notice.validUntil || notice.validUntil > now,
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1
      }
      return aValue > bValue ? 1 : -1
    })

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = filtered.slice(startIndex, endIndex)

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
        hasNext: endIndex < filtered.length,
        hasPrev: page > 1,
      }
    }
  },

  // Get notice by ID
  getNotice: async id => {
    await delay()

    const notice = noticesStore.find(n => n.id === id)
    if (!notice) {
      throw new Error('Notice not found')
    }

    // Increment view count
    notice.views = (notice.views || 0) + 1
    notice.updatedAt = new Date().toISOString()

    return notice
  },

  // Create new notice
  createNotice: async noticeData => {
    await delay()

    // Validate data
    const validatedData = noticeSchema.parse(noticeData)

    const newNotice = {
      id: `notice-${nextId++}`,
      ...validatedData,
      publishedAt: new Date().toISOString(),
      status: 'published',
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    noticesStore.push(newNotice)
    return newNotice
  },

  // Update notice
  updateNotice: async (id, updateData) => {
    await delay()

    const index = noticesStore.findIndex(n => n.id === id)
    if (index === -1) {
      throw new Error('Notice not found')
    }

    // Validate update data
    const validatedData = noticeSchema.partial().parse(updateData)

    const updatedNotice = {
      ...noticesStore[index],
      ...validatedData,
      updatedAt: new Date().toISOString(),
    }

    noticesStore[index] = updatedNotice
    return updatedNotice
  },

  // Delete notice
  deleteNotice: async id => {
    await delay()

    const index = noticesStore.findIndex(n => n.id === id)
    if (index === -1) {
      throw new Error('Notice not found')
    }

    noticesStore.splice(index, 1)
    return { success: true }
  },

  // Get notices by target audience
  getNoticesByAudience: async audience => {
    await delay()

    const now = new Date().toISOString()

    return noticesStore
      .filter(
        notice =>
          notice.status === 'published' &&
          (notice.targetAudience.includes(audience) ||
            notice.targetAudience.includes('all')) &&
          (!notice.validUntil || notice.validUntil > now),
    ).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
  },

  // Get urgent notices
  getUrgentNotices: async () => {
    await delay()

    const now = new Date().toISOString()

    return noticesStore
      .filter(
        notice =>
          notice.status === 'published' &&
          notice.priority === 'high' &&
          (!notice.validUntil || notice.validUntil > now),
    ).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
  },

  // Get recent notices
  getRecentNotices: async (limit = 5) => {
    await delay()

    const now = new Date().toISOString()

    return noticesStore
      .filter(
        notice =>
          notice.status === 'published' &&
          (!notice.validUntil || notice.validUntil > now),
      )
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, limit)
  },

  // Publish notice
  publishNotice: async id => {
    await delay()

    const index = noticesStore.findIndex(n => n.id === id)
    if (index === -1) {
      throw new Error('Notice not found')
    }

    noticesStore[index].status = 'published'
    noticesStore[index].publishedAt = new Date().toISOString()
    noticesStore[index].updatedAt = new Date().toISOString()

    return noticesStore[index]
  },

  // Unpublish notice
  unpublishNotice: async id => {
    await delay()

    const index = noticesStore.findIndex(n => n.id === id)
    if (index === -1) {
      throw new Error('Notice not found')
    }

    noticesStore[index].status = 'draft'
    noticesStore[index].updatedAt = new Date().toISOString()

    return noticesStore[index]
  },

  // Get notice statistics
  getNoticeStats: async () => {
    await delay()

    const now = new Date().toISOString()
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const stats = {
      total: noticesStore.length,
      published: noticesStore.filter(n => n.status === 'published').length,
      draft: noticesStore.filter(n => n.status === 'draft').length,
      expired: noticesStore.filter(n => n.validUntil && n.validUntil < now)
        .length,
      thisMonth: noticesStore.filter(n =>
        new Date(n.publishedAt) >= thisMonth,
      ).length,
      byType: {},
      byPriority: {},
      byAudience: {},
      totalViews: noticesStore.reduce((sum, n) => sum + (n.views || 0), 0),
      averageViews: 0,
    }

    // Group by type
    noticesStore.forEach(notice => {
      stats.byType[notice.type] = (stats.byType[notice.type] || 0) + 1
    })

    // Group by priority
    noticesStore.forEach(notice => {
      stats.byPriority[notice.priority] =
        (stats.byPriority[notice.priority] || 0) + 1
    })

    // Group by audience
    noticesStore.forEach(notice => {
      notice.targetAudience.forEach(audience => {
        stats.byAudience[audience] = (stats.byAudience[audience] || 0) + 1
      })
    })

    // Calculate average views
    if (noticesStore.length > 0) {
      stats.averageViews = Math.round(stats.totalViews / noticesStore.length)
    }

    return stats
  },

  // Search notices
  searchNotices: async query => {
    await delay()

    if (!query || query.length < 2) {
      return []
    }

    const searchLower = query.toLowerCase()
    const now = new Date().toISOString()

    return noticesStore
      .filter(
        notice =>
          notice.status === 'published' &&
          (!notice.validUntil || notice.validUntil > now) &&
          (notice.title.toLowerCase().includes(searchLower) ||
            notice.content.toLowerCase().includes(searchLower)),
      )
      .slice(0, 10) // Limit search results
  },

  // Bulk operations
  bulkUpdateNotices: async updates => {
    await delay()

    const results = []
    for (const update of updates) {
      try {
        const result = await noticesApi.updateNotice(update.id, update.data)
        results.push({ success: true, id: update.id, data: result })
      } catch (error) {
        results.push({ success: false, id: update.id, error: error.message })
      }
    }

    return results
  },

  // Get notices by class
  getNoticesByClass: async classId => {
    await delay()

    const now = new Date().toISOString()

    return noticesStore
      .filter(
        notice =>
          notice.status === 'published' &&
          (!notice.validUntil || notice.validUntil > now) &&
          (notice.classes.length === 0 || notice.classes.includes(classId)),
    ).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
  },
}

export default noticesApi
